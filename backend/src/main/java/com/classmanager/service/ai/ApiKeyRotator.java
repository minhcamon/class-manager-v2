package com.classmanager.service.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
public class ApiKeyRotator {

    private final Map<String, List<String>> providerKeysMap = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> providerIndexMap = new ConcurrentHashMap<>();
    private final Map<String, Instant> keyCooldownMap = new ConcurrentHashMap<>();

    public void registerKeys(String provider, List<String> keys) {
        if (keys != null && !keys.isEmpty()) {
            // Filter out empty or placeholder keys
            List<String> validKeys = keys.stream()
                    .filter(k -> k != null && !k.trim().isEmpty() && !k.startsWith("${"))
                    .toList();
            if (!validKeys.isEmpty()) {
                providerKeysMap.put(provider, validKeys);
                providerIndexMap.put(provider, new AtomicInteger(0));
                log.info("Registered {} valid API keys for provider '{}'", validKeys.size(), provider);
            }
        }
    }

    public Optional<String> getNextAvailableKey(String provider) {
        List<String> keys = providerKeysMap.get(provider);
        if (keys == null || keys.isEmpty()) {
            return Optional.empty();
        }

        AtomicInteger indexCounter = providerIndexMap.get(provider);
        int startIndex = Math.abs(indexCounter.getAndIncrement() % keys.size());
        Instant now = Instant.now();

        for (int i = 0; i < keys.size(); i++) {
            int candidateIndex = (startIndex + i) % keys.size();
            String candidateKey = keys.get(candidateIndex);
            Instant cooldownUntil = keyCooldownMap.get(candidateKey);

            if (cooldownUntil == null || now.isAfter(cooldownUntil)) {
                return Optional.of(candidateKey);
            }
        }

        log.warn("All keys for provider '{}' are currently in cooldown mode.", provider);
        return Optional.empty();
    }

    public void markKeyCooldown(String key, long cooldownSeconds) {
        if (key != null && !key.isEmpty()) {
            Instant until = Instant.now().plusSeconds(cooldownSeconds);
            keyCooldownMap.put(key, until);
            log.warn("API Key ending with '...' marked in cooldown for {} seconds", cooldownSeconds);
        }
    }

    public String maskKey(String key) {
        if (key == null || key.length() < 8) {
            return "****";
        }
        return "..." + key.substring(key.length() - 4);
    }
}
