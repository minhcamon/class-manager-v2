package com.classmanager.service.ai;

import com.classmanager.dto.AiReportResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    public AiReportResponse generateWithFallbackChain(String prompt, String studentName, int bonus, int penalty,
            int finalPoint, Integer rank, String tone) {
        initKeys();

        // 1. Try Gemini Provider via Spring AI
        Optional<String> geminiKeyOpt = apiKeyRotator.getNextAvailableKey("gemini");
        if (geminiKeyOpt.isPresent()) {
            String apiKey = geminiKeyOpt.get();
            try {
                log.info("Attempting AI generation via Gemini Flash API (Spring AI)...");
                String responseText = callGeminiApiWithSpringAi(prompt, apiKey);
                if (responseText != null && !responseText.trim().isEmpty()) {
                    return parseLlmResponse(responseText, "Gemini 2.0 Flash");
                }
            } catch (Exception e) {
                log.warn("Gemini Spring AI call failed: {}", e.getMessage());
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    apiKeyRotator.markKeyCooldown(apiKey, 60); // 1 min cooldown on rate limit
                }
            }
        }

        // 2. Failover to OpenAI Provider via Spring AI
        Optional<String> openaiKeyOpt = apiKeyRotator.getNextAvailableKey("openai");
        if (openaiKeyOpt.isPresent()) {
            String apiKey = openaiKeyOpt.get();
            try {
                log.info("Attempting AI generation via GPT-4o-mini API (Spring AI)...");
                String responseText = callOpenAiApiWithSpringAi(prompt, apiKey);
                if (responseText != null && !responseText.trim().isEmpty()) {
                    return parseLlmResponse(responseText, "GPT-4o-mini");
                }
            } catch (Exception e) {
                log.warn("OpenAI Spring AI call failed: {}", e.getMessage());
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
                String text = callGeminiApiWithSpringAi(prompt, geminiKeyOpt.get());
                if (text != null && !text.isEmpty())
                    return text.trim();
            } catch (Exception e) {
                log.warn("Gemini refine failed: {}", e.getMessage());
            }
        }

        Optional<String> openaiKeyOpt = apiKeyRotator.getNextAvailableKey("openai");
        if (openaiKeyOpt.isPresent()) {
            try {
                String text = callOpenAiApiWithSpringAi(prompt, openaiKeyOpt.get());
                if (text != null && !text.isEmpty())
                    return text.trim();
            } catch (Exception e) {
                log.warn("OpenAI refine failed: {}", e.getMessage());
            }
        }

        return currentSummary + " (Đã điều chỉnh: " + userInstruction + ")";
    }

    private String callGeminiApiWithSpringAi(String promptText, String apiKey) {
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .apiKey(apiKey)
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/openai/")
                .model("gemini-2.5-flash")
                .temperature(0.7)
                .build();
        OpenAiChatModel chatModel = OpenAiChatModel.builder()
                .options(options)
                .build();

        Prompt prompt = new Prompt(promptText);
        ChatResponse response = chatModel.call(prompt);
        if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
            AssistantMessage output = response.getResult().getOutput();
            return output.getText();
        }
        return null;
    }

    private String callOpenAiApiWithSpringAi(String promptText, String apiKey) {
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .apiKey(apiKey)
                .baseUrl("https://api.openai.com")
                .model("gpt-4o-mini")
                .temperature(0.7)
                .build();
        OpenAiChatModel chatModel = OpenAiChatModel.builder()
                .options(options)
                .build();

        Prompt prompt = new Prompt(List.of(
                new SystemMessage("Bạn là trợ lý giáo viên chuyên nghiệp."),
                new UserMessage(promptText)
        ));
        ChatResponse response = chatModel.call(prompt);
        if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
            AssistantMessage output = response.getResult().getOutput();
            return output.getText();
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
