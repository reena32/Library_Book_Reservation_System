package com.library.service;

import com.library.model.Book;
import com.library.model.Reservation;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.ReservationRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    // Default configuration: 14 days reservation period, $2 (or Rs 5) per day fine
    private static final int LOAN_PERIOD_DAYS = 14;
    private double dailyFineRate = 5.0;

    public Reservation reserveBook(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is currently unavailable for reservation");
        }

        boolean alreadyReserved = reservationRepository.existsByUserIdAndBookIdAndStatus(userId, bookId, "RESERVED");
        if (alreadyReserved) {
            throw new RuntimeException("You already have an active reservation for this book");
        }

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        LocalDate today = LocalDate.now();
        LocalDate dueDate = today.plusDays(LOAN_PERIOD_DAYS);

        Reservation reservation = new Reservation(user, book, today, dueDate, "RESERVED");
        return reservationRepository.save(reservation);
    }

    public List<Reservation> getReservationsByUser(Long userId) {
        List<Reservation> list = reservationRepository.findByUserId(userId);
        list.forEach(this::calculateFine);
        return list;
    }

    public List<Reservation> getAllReservations() {
        List<Reservation> list = reservationRepository.findAll();
        list.forEach(this::calculateFine);
        return list;
    }

    public Reservation returnBook(Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!"RESERVED".equals(res.getStatus())) {
            throw new RuntimeException("Reservation is already processed (" + res.getStatus() + ")");
        }

        res.setReturnDate(LocalDate.now());
        res.setStatus("RETURNED");
        calculateFine(res);

        // Increment book availability
        Book book = res.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return reservationRepository.save(res);
    }

    public Reservation cancelReservation(Long reservationId, Long userId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!res.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized action");
        }

        if (!"RESERVED".equals(res.getStatus())) {
            throw new RuntimeException("Only active reservations can be cancelled");
        }

        res.setStatus("CANCELLED");
        res.setReturnDate(LocalDate.now());

        // Restore copy
        Book book = res.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return reservationRepository.save(res);
    }

    private void calculateFine(Reservation res) {
        LocalDate endPoint = res.getReturnDate() != null ? res.getReturnDate() : LocalDate.now();
        if (endPoint.isAfter(res.getDueDate())) {
            long overdueDays = ChronoUnit.DAYS.between(res.getDueDate(), endPoint);
            res.setFineAmount(overdueDays * dailyFineRate);
        } else {
            res.setFineAmount(0.0);
        }
    }

    public double getDailyFineRate() {
        return dailyFineRate;
    }

    public void setDailyFineRate(double dailyFineRate) {
        this.dailyFineRate = dailyFineRate;
    }
}
