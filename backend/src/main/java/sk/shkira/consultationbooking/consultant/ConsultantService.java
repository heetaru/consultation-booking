package sk.shkira.consultationbooking.consultant;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConsultantService {

    public List<Consultant> getConsultants() {
        return List.of(
                new Consultant(1, "Anna Novak", "Career advice"),
                new Consultant(2, "Peter Kral", "Software development")
        );
    }
}
