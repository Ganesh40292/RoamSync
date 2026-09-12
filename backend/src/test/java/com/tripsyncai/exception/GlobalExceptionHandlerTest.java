package com.tripsyncai.exception;

import com.tripsyncai.dto.ApiErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.context.request.ServletWebRequest;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleResourceNotFoundException() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/trips/999");
        ServletWebRequest webRequest = new ServletWebRequest(request);

        ResourceNotFoundException ex = new ResourceNotFoundException("Trip not found with id: 999");
        ResponseEntity<ApiErrorResponse> response = exceptionHandler.handleResourceNotFoundException(ex, webRequest);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("RESOURCE_NOT_FOUND", response.getBody().getCode());
        assertEquals("Trip not found with id: 999", response.getBody().getMessage());
        assertEquals("/api/trips/999", response.getBody().getPath());
    }

    @Test
    void testHandleAccessDeniedException() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/trips/1/members");
        ServletWebRequest webRequest = new ServletWebRequest(request);

        AccessDeniedException ex = new AccessDeniedException("Forbidden");
        ResponseEntity<ApiErrorResponse> response = exceptionHandler.handleAccessDeniedException(ex, webRequest);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().getStatus());
        assertEquals("ACCESS_DENIED", response.getBody().getCode());
        assertTrue(response.getBody().getMessage().contains("do not have permission"));
    }

    @Test
    void testHandleBadCredentialsException() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/auth/login");
        ServletWebRequest webRequest = new ServletWebRequest(request);

        BadCredentialsException ex = new BadCredentialsException("Bad credentials");
        ResponseEntity<ApiErrorResponse> response = exceptionHandler.handleBadCredentialsException(ex, webRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(401, response.getBody().getStatus());
        assertEquals("INVALID_CREDENTIALS", response.getBody().getCode());
        assertEquals("Invalid username or password", response.getBody().getMessage());
    }

    @Test
    void testHandleGenericExceptionDoesNotLeakInternalDetails() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/trips");
        ServletWebRequest webRequest = new ServletWebRequest(request);

        Exception ex = new NullPointerException("Internal memory leak pointer at line 42");
        ResponseEntity<ApiErrorResponse> response = exceptionHandler.handleGlobalException(ex, webRequest);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("INTERNAL_SERVER_ERROR", response.getBody().getCode());
        // Internal exception message must NOT be returned to the client
        assertFalse(response.getBody().getMessage().contains("Internal memory leak pointer"));
        assertEquals("An unexpected error occurred. Please try again later.", response.getBody().getMessage());
    }
}
