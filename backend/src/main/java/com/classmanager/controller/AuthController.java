package com.classmanager.controller;

import com.classmanager.dto.auth.request.GoogleLoginRequest;
import com.classmanager.dto.auth.request.SelectRoleRequest;
import com.classmanager.dto.auth.request.UserLoginRequest;
import com.classmanager.dto.auth.request.UserRegisterRequest;
import com.classmanager.dto.auth.response.AuthResponse;
import com.classmanager.dto.auth.response.TokenPair;
import com.classmanager.dto.auth.response.UserResponse;
import com.classmanager.dto.common.APIResponse;
import com.classmanager.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Onboarding", description = "Các API liên quan đến đăng ký, đăng nhập, cấp lại token và lựa chọn vai trò (onboarding)")
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.cookie-secure:false}")
    private boolean cookieSecure;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản cục bộ", description = "Tạo một tài khoản người dùng mới bằng username, mật khẩu và số điện thoại. Vai trò ban đầu sẽ được để trống (null) để phục vụ luồng onboarding.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đăng ký tài khoản thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu đăng ký không hợp lệ hoặc tài khoản/số điện thoại đã tồn tại")
    })
    public ResponseEntity<APIResponse<UserResponse>> register(@Valid @RequestBody UserRegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.ok(APIResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập cục bộ", description = "Đăng nhập bằng username và mật khẩu. Trả về JWT Access Token và ghi nhận Refresh Token vào HttpOnly Cookie.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đăng nhập thành công"),
            @ApiResponse(responseCode = "401", description = "Thông tin đăng nhập không chính xác")
    })
    public ResponseEntity<APIResponse<AuthResponse>> login(
            @Valid @RequestBody UserLoginRequest request,
            HttpServletResponse response) {
        TokenPair tokenPair = authService.login(request);
        setRefreshTokenCookie(response, tokenPair.getRefreshToken());

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .expiresIn(tokenPair.getExpiresIn())
                .message("Login successfully")
                .build();

        return ResponseEntity.ok(APIResponse.success("Login successfully", authResponse));
    }

    @PostMapping("/google")
    @Operation(summary = "Đăng nhập bằng Google", description = "Đăng nhập hoặc tự động đăng ký bằng Google ID Token. Trả về JWT Access Token và ghi nhận Refresh Token vào HttpOnly Cookie.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đăng nhập bằng Google thành công"),
            @ApiResponse(responseCode = "400", description = "Google ID Token không hợp lệ hoặc lỗi xác thực")
    })
    public ResponseEntity<APIResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request,
            HttpServletResponse response) {
        TokenPair tokenPair = authService.loginWithGoogle(request);
        setRefreshTokenCookie(response, tokenPair.getRefreshToken());

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .expiresIn(tokenPair.getExpiresIn())
                .message("Google Login successfully")
                .build();

        return ResponseEntity.ok(APIResponse.success("Google Login successfully", authResponse));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Lấy lại Access Token mới", description = "Đọc Refresh Token từ HttpOnly Cookie để sinh ra Access Token và Refresh Token mới.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cấp lại token thành công"),
            @ApiResponse(responseCode = "401", description = "Refresh Token không hợp lệ hoặc đã hết hạn")
    })
    public ResponseEntity<APIResponse<AuthResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        TokenPair tokenPair = authService.refreshToken(refreshToken);
        setRefreshTokenCookie(response, tokenPair.getRefreshToken());

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .expiresIn(tokenPair.getExpiresIn())
                .message("Token refreshed successfully")
                .build();

        return ResponseEntity.ok(APIResponse.success("Token refreshed successfully", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất tài khoản", description = "Xóa Cookie Refresh Token để hoàn tất đăng xuất.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đăng xuất thành công")
    })
    public ResponseEntity<APIResponse<Void>> logout(HttpServletResponse response) {
        clearRefreshTokenCookie(response);
        return ResponseEntity.ok(APIResponse.success("Logout successfully", null));
    }

    @PutMapping("/select-role")
    @Operation(summary = "Lựa chọn vai trò (Onboarding)", description = "Yêu cầu người dùng lựa chọn vai trò của mình (TEACHER hoặc STUDENT). Chỉ cho phép gọi sau khi đã xác thực nhưng chưa chọn role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lựa chọn vai trò thành công"),
            @ApiResponse(responseCode = "400", description = "Vai trò không hợp lệ"),
            @ApiResponse(responseCode = "403", description = "Chưa đăng nhập")
    })
    public ResponseEntity<APIResponse<UserResponse>> selectRole(@Valid @RequestBody SelectRoleRequest request) {
        Long userId = getCurrentUserId();
        UserResponse response = authService.selectRole(userId, request);
        return ResponseEntity.ok(APIResponse.success("Role selected successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin tài khoản hiện tại", description = "Lấy thông tin chi tiết của tài khoản đang đăng nhập thông qua Bearer Token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy thông tin thành công"),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực hoặc token không hợp lệ")
    })
    public ResponseEntity<APIResponse<UserResponse>> getMe() {
        Long userId = getCurrentUserId();
        UserResponse response = authService.getMe(userId);
        return ResponseEntity.ok(APIResponse.success("Get user profile successfully", response));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return "";
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .maxAge(604800) // 7 days in seconds
                .path("/api/v1/auth")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .maxAge(0)
                .path("/api/v1/auth")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
