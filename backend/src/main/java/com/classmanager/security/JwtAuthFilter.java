package com.classmanager.security;

import com.classmanager.dto.common.ErrorResponse;
import com.classmanager.enums.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    public JwtAuthFilter(JwtUtil jwtUtil, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // 1. Skip validation for whitelist endpoints (configured in SecurityConfig too)
        if (isWhitelisted(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null) {
            // Authentication is handled by Spring Security, but if token is missing and endpoint is protected,
            // we let it pass to SecurityConfig which will trigger standard 401/403.
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtUtil.isTokenValid(token)) {
            writeErrorResponse(response, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid or expired JWT token", path);
            return;
        }

        Long userId = jwtUtil.extractUserId(token);
        Role role = jwtUtil.extractRole(token);
        String schoolName = jwtUtil.extractSchoolName(token);

        // 2. Setup Security Context
        String roleName = role != null ? "ROLE_" + role.name() : "ROLE_PENDING_ONBOARDING";
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));

        // Create Custom User Details wrapper or use Principal/Credentials/Authorities
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userId, // Principal is user ID
                null,
                authorities
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Auth Guard logic check
        // Check role == null
        if (role == null) {
            if (!path.equals("/api/v1/auth/select-role") && !path.equals("/api/v1/auth/me")) {
                writeErrorResponse(response, HttpStatus.FORBIDDEN, "ROLE_NOT_SELECTED", "User has not selected a role yet.", path);
                return;
            }
        }

        // Check role == TEACHER and schoolName == null
        if (role == Role.TEACHER && schoolName == null) {
            if (!path.equals("/api/v1/schools") && !path.equals("/api/v1/auth/me") && !path.equals("/api/v1/auth/select-role")) {
                writeErrorResponse(response, HttpStatus.FORBIDDEN, "PROFILE_INCOMPLETE", "Teacher profile is incomplete. Please register a school first.", path);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isWhitelisted(String path) {
        return path.equals("/api/v1/auth/login")
                || path.equals("/api/v1/auth/register")
                || path.equals("/api/v1/auth/google")
                || path.equals("/api/v1/auth/refresh")
                || path.equals("/api/v1/auth/logout")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

    private void writeErrorResponse(HttpServletResponse response, HttpStatus status, String error, String message, String path) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String timestamp = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(timestamp)
                .status(status.value())
                .error(error)
                .message(message)
                .path(path)
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
