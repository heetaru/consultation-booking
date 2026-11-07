package sk.shkira.consultationbooking.consultant;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultantService {
    private final ConsultantRepository consultantRepository;

    public List<Consultant> getConsultants() {
        return consultantRepository.findAll(Sort.by("id"));
    }

    public void requireConsultant(long id) {
        if (!consultantRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Consultant not found");
        }
    }
}
