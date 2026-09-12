package com.tripsyncai.service;

import com.tripsyncai.dto.ForgotPasswordRequest;
import com.tripsyncai.dto.ResetPasswordRequest;
import com.tripsyncai.entity.PasswordResetToken;
import com.tripsyncai.entity.User;
import com.tripsyncai.repository.PasswordResetTokenRepository;
import com.tripsyncai.repository.UserRepository;
import com.tripsyncai.util.TokenUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthPasswordResetTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("traveler")
                .email("traveler@example.com")
                .password("encodedOldPassword")
                .build();
    }

    @Test
    void testForgotPasswordEnumerationSafe() {
        when(userRepository.findByEmail("traveler@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        Map<String, String> responseExist = authService.forgotPassword(new ForgotPasswordRequest("traveler@example.com"));
        Map<String, String> responseNonExist = authService.forgotPassword(new ForgotPasswordRequest("nonexistent@example.com"));

        assertEquals(responseExist.get("message"), responseNonExist.get("message"));
        assertEquals("If this email is registered, a password reset link has been sent.", responseExist.get("message"));

        verify(passwordResetTokenRepository).deleteByUser(user);
        verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    void testResetPasswordSuccess() {
        String rawToken = "my-secret-reset-token-1234567890";
        String tokenHash = TokenUtils.hashToken(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .id(10L)
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        when(passwordResetTokenRepository.findByTokenHashAndUsedFalse(tokenHash)).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("newSecret123")).thenReturn("encodedNewPassword");

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "newSecret123");
        Map<String, String> response = authService.resetPassword(request);

        assertNotNull(response);
        assertEquals("Password has been successfully reset. You can now log in.", response.get("message"));
        assertTrue(resetToken.getUsed());
        assertEquals("encodedNewPassword", user.getPassword());

        verify(userRepository).save(user);
        verify(passwordResetTokenRepository).save(resetToken);
    }

    @Test
    void testResetPasswordExpiredTokenFails() {
        String rawToken = "expired-token-123";
        String tokenHash = TokenUtils.hashToken(rawToken);

        PasswordResetToken expiredToken = PasswordResetToken.builder()
                .id(10L)
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().minusMinutes(5)) // Expired
                .used(false)
                .build();

        when(passwordResetTokenRepository.findByTokenHashAndUsedFalse(tokenHash)).thenReturn(Optional.of(expiredToken));

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "newSecret123");
        assertThrows(IllegalArgumentException.class, () -> authService.resetPassword(request));
    }
}
