package com.library.config;

import com.library.model.Book;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, BookRepository bookRepository) {
        return args -> {
            // Seed Admin Account if not present
            if (!userRepository.existsByStudentId("ADMIN01")) {
                User admin = new User(
                        "ADMIN01",
                        "Library Administrator",
                        "admin@library.com",
                        "Library Administration",
                        "admin123",
                        "ADMIN"
                );
                userRepository.save(admin);
                System.out.println(">>> Default Admin created: admin@library.com / admin123 (or ID: ADMIN01)");
            }

            // Seed Sample Books if database is empty
            if (bookRepository.count() == 0) {
                bookRepository.save(new Book("Clean Code", "Robert C. Martin", "Computer Science", "978-0132350884", 5, 5));
                bookRepository.save(new Book("Introduction to Algorithms", "Thomas H. Cormen", "Computer Science", "978-0262033848", 4, 4));
                bookRepository.save(new Book("Database System Concepts", "Abraham Silberschatz", "Information Technology", "978-0073523323", 3, 3));
                bookRepository.save(new Book("Computer Networking: A Top-Down Approach", "James Kurose", "Networking", "978-0133594140", 5, 5));
                bookRepository.save(new Book("Operating System Principles", "Peter B. Galvin", "Computer Science", "978-0471417439", 4, 4));
                bookRepository.save(new Book("Artificial Intelligence: A Modern Approach", "Stuart Russell", "AI & ML", "978-0136042594", 3, 3));
                System.out.println(">>> Sample books seeded successfully!");
            }
        };
    }
}
