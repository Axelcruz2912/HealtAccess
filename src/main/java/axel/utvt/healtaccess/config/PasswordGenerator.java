package axel.utvt.healtaccess.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String password = "123456";
        String hash = encoder.encode(password);

        System.out.println("==========================================");
        System.out.println("CONTRASEÑA: " + password);
        System.out.println("HASH BCrypt: " + hash);
        System.out.println("==========================================");

        boolean matches = encoder.matches(password, hash);
        System.out.println("Verificación: " + (matches ? "✅ CORRECTO" : "❌ INCORRECTO"));

        String password2 = "admin123";
        String hash2 = encoder.encode(password2);
        System.out.println("\nPara 'admin123': " + hash2);
    }
}