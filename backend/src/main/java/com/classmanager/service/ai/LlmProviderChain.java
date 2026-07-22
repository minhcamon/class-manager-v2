package com.classmanager.service.ai;

import com.classmanager.dto.AiReportResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmProviderChain {

    private final ApiKeyRotator apiKeyRotator;
    private final RuleBasedFallbackEngine fallbackEngine;
    private final ObjectMapper objectMapper;

    @Value("${ai.gemini.keys:}")
    private String geminiKeysRaw;

    @Value("${ai.openai.keys:}")
    private String openaiKeysRaw;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public void initKeys() {
        if (geminiKeysRaw != null && !geminiKeysRaw.isEmpty()) {
            List<String> gKeys = Arrays.stream(geminiKeysRaw.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            apiKeyRotator.registerKeys("gemini", gKeys);
        }
        if (openaiKeysRaw != null && !openaiKeysRaw.isEmpty()) {
            List<String> oKeys = Arrays.stream(openaiKeysRaw.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            apiKeyRotator.registerKeys("openai", oKeys);
        }
    }

    public AiReportResponse generateWithFallbackChain(String prompt, String studentName, int bonus, int penalty, int finalPoint, Integer rank, String tone) {
        initKeys();

        // 1. Try Gemini Provider
        Optional<String> geminiKeyOpt = apiKeyRotator.getNextAvailableKey("gemini");
        if (geminiKeyOpt.isPresent()) {
            String apiKey = geminiKeyOpt.get();
            try {
                log.info("Attempting AI generation via Gemini Flash API...");
                String responseText = callGeminiApi(prompt, apiKey);
                if (responseText != null && !responseText.trim().isEmpty()) {
                    return parseLlmResponse(responseText, "Gemini 2.0 Flash");
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed: {}", e.getMessage());
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    apiKeyRotator.markKeyCooldown(apiKey, 60); // 1 min cooldown on rate limit
                }
            }
        }

        // 2. Failover to OpenAI Provider
        Optional<String> openaiKeyOpt = apiKeyRotator.getNextAvailableKey("openai");
        if (openaiKeyOpt.isPresent()) {
            String apiKey = openaiKeyOpt.get();
            try {
                log.info("Attempting AI generation via GPT-4o-mini API...");
                String responseText = callOpenAiApi(prompt, apiKey);
                if (responseText != null && !responseText.trim().isEmpty()) {
                    return parseLlmResponse(responseText, "GPT-4o-mini");
                }
            } catch (Exception e) {
                log.warn("OpenAI API call failed: {}", e.getMessage());
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    apiKeyRotator.markKeyCooldown(apiKey, 60);
                }
            }
        }

        // 3. Final Fallback to Rule-based Engine
        log.info("All Cloud LLM APIs failed or unconfigured. Falling back to Rule-based Engine.");
        return fallbackEngine.generateFallbackReport(studentName, bonus, penalty, finalPoint, rank, tone);
    }

    public String refineWithFallbackChain(String currentSummary, String userInstruction, String tone) {
        initKeys();
        String prompt = "Bạn là trợ lý giáo viên. Hãy sửa lại đoạn nhận xét học sinh sau đây theo yêu cầu.\n"
                + "Nhận xét hiện tại: \"" + currentSummary + "\"\n"
                + "Yêu cầu chỉnh sửa: \"" + userInstruction + "\"\n"
                + "Văn phong mong muốn: " + (tone != null ? tone : "Tự nhiên, sư phạm") + "\n"
                + "Chỉ trả về duy nhất nội dung nhận xét đã chỉnh sửa, không kèm lời chào.";

        Optional<String> geminiKeyOpt = apiKeyRotator.getNextAvailableKey("gemini");
        if (geminiKeyOpt.isPresent()) {
            try {
                String text = callGeminiApi(prompt, geminiKeyOpt.get());
                if (text != null && !text.isEmpty()) return text.trim();
            } catch (Exception e) {
                log.warn("Gemini refine failed: {}", e.getMessage());
            }
        }

        Optional<String> openaiKeyOpt = apiKeyRotator.getNextAvailableKey("openai");
        if (openaiKeyOpt.isPresent()) {
            try {
                String text = callOpenAiApi(prompt, openaiKeyOpt.get());
                if (text != null && !text.isEmpty()) return text.trim();
            } catch (Exception e) {
                log.warn("OpenAI refine failed: {}", e.getMessage());
            }
        }

        return currentSummary + " (Đã điều chỉnh: " + userInstruction + ")";
    }

    private String callGeminiApi(String prompt, String apiKey) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        String jsonReq = objectMapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonReq))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini HTTP Error " + response.statusCode() + ": " + response.body());
        }

        JsonNode rootNode = objectMapper.readTree(response.body());
        JsonNode candidates = rootNode.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && !parts.isEmpty()) {
                return parts.get(0).path("text").asText();
            }
        }
        return null;
    }

    private String callOpenAiApi(String prompt, String apiKey) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";
        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", "Bạn là trợ lý giáo viên chuyên nghiệp."),
                        Map.of("role", "user", "content", prompt)
                )
        );

        String jsonReq = objectMapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonReq))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenAI HTTP Error " + response.statusCode() + ": " + response.body());
        }

        JsonNode rootNode = objectMapper.readTree(response.body());
        JsonNode choices = rootNode.path("choices");
        if (choices.isArray() && !choices.isEmpty()) {
            return choices.get(0).path("message").path("content").asText();
        }
        return null;
    }

    private AiReportResponse parseLlmResponse(String rawText, String provider) {
        // Strip markdown code fences if any
        String cleanText = rawText.replaceAll("```json", "").replaceAll("```", "").trim();
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();
        List<String> actions = new ArrayList<>();

        try {
            if (cleanText.startsWith("{") && cleanText.endsWith("}")) {
                JsonNode json = objectMapper.readTree(cleanText);
                String summary = json.path("summaryText").asText(cleanText);
                if (json.has("strengths") && json.get("strengths").isArray()) {
                    json.get("strengths").forEach(node -> strengths.add(node.asText()));
                }
                if (json.has("improvements") && json.get("improvements").isArray()) {
                    json.get("improvements").forEach(node -> improvements.add(node.asText()));
                }
                if (json.has("suggestedActions") && json.get("suggestedActions").isArray()) {
                    json.get("suggestedActions").forEach(node -> actions.add(node.asText()));
                }

                return AiReportResponse.builder()
                        .summaryText(summary)
                        .strengths(strengths)
                        .improvements(improvements)
                        .suggestedActions(actions)
                        .isFallback(false)
                        .providerUsed(provider)
                        .build();
            }
        } catch (Exception e) {
            log.debug("Raw text is not strict JSON, using raw text as summary", e);
        }

        return AiReportResponse.builder()
                .summaryText(cleanText)
                .strengths(strengths)
                .improvements(improvements)
                .suggestedActions(actions)
                .isFallback(false)
                .providerUsed(provider)
                .build();
    }
}
