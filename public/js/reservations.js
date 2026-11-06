
// =====================================
// DREAM LIFE CAFE - TABLE RESERVATIONS
// =====================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservation-form");

  if (!form) return;

  const dateInput = document.getElementById("date");
  const message = document.getElementById("reservation-message");
  const submit = form.querySelector('button[type="submit"]');

  // Prevent past-date reservations
  if (dateInput) {
    const today = new Date();

    const localToday = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);

    dateInput.min = localToday;
  }

  // Handle reservation submission
  form.addEventListener("submit", async event => {
    event.preventDefault();

    const data = Object.fromEntries(
      new FormData(form).entries()
    );

    if (!submit) return;

    submit.disabled = true;
    submit.textContent = "Sending...";

    try {
      const result = await CafeAPI.saveReservation({
        name: data.name,
        phone: data.phone,
        date: data.date,
        time: data.time,
        guests: Number(data.guests),
        specialRequests: data.specialRequests || ""
      });

      form.reset();

      showMessage(
        message,
        `${result.message} Reference: ${result.reservationId}. We look forward to welcoming you!`
      );

    } catch (error) {
      showMessage(message, error.message, true);

    } finally {
      submit.disabled = false;
      submit.textContent = "Request Reservation";
    }
  });
});
