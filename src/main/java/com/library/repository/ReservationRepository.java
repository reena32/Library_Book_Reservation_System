package com.library.repository;

import com.library.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByUserIdAndStatus(Long userId, String status);
    List<Reservation> findByBookIdAndStatus(Long bookId, String status);
    boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);
}
