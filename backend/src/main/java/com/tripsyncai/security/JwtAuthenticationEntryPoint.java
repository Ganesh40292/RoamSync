package com.tripsyncai.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripsyncai.dto.ApiErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        final ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now().toString())
                .status(HttpServletResponse.SC_UNAUTHORIZED)
                .code("AUTHENTICATION_REQUIRED")
                .message("Full authentication is required to access this resource")
                .path(request.getServletPath())
                .build();

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
