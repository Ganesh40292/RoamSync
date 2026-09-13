package com.tripsyncai.service;

import com.tripsyncai.dto.AuthRequest;
import com.tripsyncai.dto.AuthResponse;
import com.tripsyncai.dto.ForgotPasswordRequest;
import com.tripsyncai.dto.ResetPasswordRequest;
import com.tripsyncai.entity.PasswordResetToken;
import com.tripsyncai.entity.User;
import com.tripsyncai.exception.UnauthorizedException;
import com.tripsyncai.repository.PasswordResetTokenRepository;
import com.tripsyncai.repository.UserRepository;
import com.tripsyncai.security.JwtService;
import com.tripsyncai.util.TokenUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SecurityAuditService securityAuditService;

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role("ROLE_USER")
                .build();

        userRepository.save(user);
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Invalid username or password");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        
        userRepository.findByEmail(email).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser(user);

            String rawToken = TokenUtils.generateSecureToken(32);
            String tokenHash = TokenUtils.hashToken(rawToken);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(tokenHash)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .used(false)
                    .build();

            passwordResetTokenRepository.save(resetToken);

            log.info("Secure password reset token generated for user: {} (token: {})", user.getUsername(), rawToken);
        });

        // Constant response message to prevent account enumeration attacks
        return Map.of("message", "If this email is registered, a password reset link has been sent.");
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        String rawToken = request.getToken() != null ? request.getToken().trim() : "";
        String tokenHash = TokenUtils.hashToken(rawToken);

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHashAndUsedFalse(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password successfully reset for user: {}", user.getUsername());

        securityAuditService.recordEvent(
                null,
                user.getId(),
                "PASSWORD_RESET_COMPLETED",
                String.format("Password reset completed for user @%s", user.getUsername()),
                null
        );

        return Map.of("message", "Password has been successfully reset. You can now log in.");
    }
}
