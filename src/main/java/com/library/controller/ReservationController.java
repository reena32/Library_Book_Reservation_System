package com.library.controller;

import com.library.model.Reservation;
import com.library.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping("/reserve")
    public ResponseEntity<?> reserveBook(@RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        Long bookId = payload.get("bookId");

        if (userId == null || bookId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "userId and bookId are required"));
        }

        try {
            Reservation res = reservationService.reserveBook(userId, bookId);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getReservationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getReservationsByUser(userId));
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            Reservation res = reservationService.returnBook(id);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "userId is required"));
        }
        try {
            Reservation res = reservationService.cancelReservation(id, userId);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/fine-rate")
    public ResponseEntity<?> getFineRate() {
        return ResponseEntity.ok(Map.of("dailyFineRate", reservationService.getDailyFineRate()));
    }

    @PostMapping("/fine-rate")
    public ResponseEntity<?> setFineRate(@RequestBody Map<String, Double> payload) {
        Double rate = payload.get("dailyFineRate");
        if (rate == null || rate < 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Valid fine rate is required"));
        }
        reservationService.setDailyFineRate(rate);
        return ResponseEntity.ok(Map.of("message", "Fine rate updated successfully", "dailyFineRate", rate));
    }
}
