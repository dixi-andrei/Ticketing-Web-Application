package com.mytickets.ticketingApp.repository;

import com.mytickets.ticketingApp.model.AuthProvider;
import com.mytickets.ticketingApp.model.ERole;
import com.mytickets.ticketingApp.model.Role;
import com.mytickets.ticketingApp.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
public class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Test
    public void testFindByEmail() {
        // Create a role
        Role userRole = new Role();
        userRole.setName(ERole.ROLE_USER);
        entityManager.persist(userRole);

        // Create a user
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEnabled(true);
        user.setProvider(AuthProvider.LOCAL);

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        entityManager.persist(user);
        entityManager.flush();

        // Test findByEmail
        Optional<User> found = userRepository.findByEmail("test@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    public void testExistsByEmail() {
        // Create a role
        Role userRole = new Role();
        userRole.setName(ERole.ROLE_USER);
        entityManager.persist(userRole);

        // Create a user
        User user = new User();
        user.setEmail("exists@example.com");
        user.setPassword("password");
        user.setFirstName("Exists");
        user.setLastName("User");
        user.setEnabled(true);
        user.setProvider(AuthProvider.LOCAL);

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        entityManager.persist(user);
        entityManager.flush();

        // Test existsByEmail
        boolean exists = userRepository.existsByEmail("exists@example.com");
        assertThat(exists).isTrue();

        boolean doesNotExist = userRepository.existsByEmail("notexists@example.com");
        assertThat(doesNotExist).isFalse();
    }
}