document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = window.JO_FARMS_API_BASE || "http://localhost:4003";
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav-links]");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const forms = document.querySelectorAll("form[data-api-endpoint]");

  forms.forEach((form) => {
    const feedback = form.querySelector("[data-form-feedback]");
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (submitButton) {
        submitButton.disabled = true;
      }

      if (feedback) {
        feedback.className = "form-feedback";
        feedback.textContent = "Submitting...";
      }

      const endpoint = form.getAttribute("data-api-endpoint");
      const payload = Object.fromEntries(new FormData(form).entries());

      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          const message = Array.isArray(result.errors)
            ? result.errors.join(" ")
            : result.message || "Submission failed.";
          throw new Error(message);
        }

        const successMessage =
          form.getAttribute("data-success-message") ||
          "Submitted successfully.";

        if (feedback) {
          feedback.className = "form-feedback form-feedback-success";
          feedback.textContent = successMessage;
        }

        form.reset();
      } catch (error) {
        if (feedback) {
          feedback.className = "form-feedback form-feedback-error";
          feedback.textContent =
            error.message || "An unexpected error occurred.";
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  });
});
