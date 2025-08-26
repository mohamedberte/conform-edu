const Features = () => {
  const featuresList = [
    {
      title: "Student Registration Management",
      description: "Easily manage student registrations with a streamlined process that ensures all necessary information is collected and stored securely."
    },
    {
      title: "Automatic Teacher Assignment",
      description: "Automatically assign teachers to classes based on their expertise and availability, ensuring optimal learning experiences for students."
    },
    {
      title: "Grade Entry",
      description: "Facilitate quick and easy grade entry for teachers, allowing them to focus more on teaching and less on administrative tasks."
    },
    {
      title: "Report Generation",
      description: "Generate comprehensive reports on student performance, attendance, and other metrics to help educators make informed decisions."
    },
    {
      title: "Parent Portal",
      description: "Provide parents with a dedicated portal to track their child's progress, view grades, and communicate with teachers."
    }
  ];

  return (
    <section className="features-section">
      <h2 className="text-2xl font-bold mb-4">Key Features</h2>
      <ul className="list-disc pl-5">
        {featuresList.map((feature, index) => (
          <li key={index} className="mb-3">
            <h3 className="font-semibold">{feature.title}</h3>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Features;