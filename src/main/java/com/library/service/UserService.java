package com.library.service;

import com.library.model.User;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerStudent(User user) {
        if (userRepository.existsByStudentId(user.getStudentId())) {
            throw new RuntimeException("Student ID already exists!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }
        user.setRole("STUDENT");
        return userRepository.save(user);
    }

    public Optional<User> login(String identifier, String password) {
        // Can log in with either studentId or email
        Optional<User> user = userRepository.findByStudentId(identifier);
        if (user.isEmpty()) {
            user = userRepository.findByEmail(identifier);
        }

        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user;
        }
        return Optional.empty();
    }

    public List<User> getAllStudents() {
        return userRepository.findByRole("STUDENT");
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
