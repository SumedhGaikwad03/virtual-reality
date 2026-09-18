/*
 * PURPOSE:
 * Process / Workflow explanation for the Rental Desk service.
 *
 * FLOW:
 * RentalsPage -> RentalProcessSection.
 *
 * RESPONSIBILITY:
 * Explains how Virtual Reality operates the Rental Desk in three factual, clear steps
 * without exaggerated claims or fabricated guarantees.
 */

export function RentalProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Tell us what you need",
      description:
        "Share the flat configuration, preferred area, and any specific requirements for your next home.",
    },
    {
      number: "02",
      title: "We review your requirement",
      description:
        "Our rental desk reviews the enquiry and looks at relevant available properties in our network.",
    },
    {
      number: "03",
      title: "We connect you",
      description:
        "We get in touch directly to discuss suitable options, answer your questions, and coordinate next steps.",
    },
  ];

  return (
    <section className="rental-process-section" aria-labelledby="rental-process-heading">
      <div className="rental-section-container">
        <div className="rental-section-header text-center">
          <span className="rental-eyebrow">HOW THE RENTAL DESK WORKS</span>
          <h2 id="rental-process-heading" className="rental-section-title">
            A quiet, direct connection.
          </h2>
          <p className="rental-section-subtitle max-w-reading">
            No public listing chaos or automated spam. Just clear communication and personal follow-up.
          </p>
        </div>

        <div className="rental-process-grid">
          {steps.map((step) => (
            <div key={step.number} className="rental-process-card">
              <span className="rental-process-number">{step.number}</span>
              <h3 className="rental-process-title">{step.title}</h3>
              <p className="rental-process-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
