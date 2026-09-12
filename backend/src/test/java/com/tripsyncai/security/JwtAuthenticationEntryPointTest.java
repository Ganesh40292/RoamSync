package com.tripsyncai.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripsyncai.dto.ApiErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.InsufficientAuthenticationException;

import static org.junit.jupiter.api.Assertions.*;

class JwtAuthenticationEntryPointTest {

    private final JwtAuthenticationEntryPoint entryPoint = new JwtAuthenticationEntryPoint();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testCommenceReturnsStandardizedApiErrorResponse() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/trips");
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(request, response, new InsufficientAuthenticationException("No credentials provided"));

        assertEquals(401, response.getStatus());
        assertEquals("application/json", response.getContentType());

        String json = response.getContentAsString();
        ApiErrorResponse error = objectMapper.readValue(json, ApiErrorResponse.class);

        assertEquals(401, error.getStatus());
        assertEquals("AUTHENTICATION_REQUIRED", error.getCode());
        assertEquals("Full authentication is required to access this resource", error.getMessage());
        assertEquals("/api/trips", error.getPath());
    }
}
