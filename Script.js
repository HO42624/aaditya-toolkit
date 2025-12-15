const pdfs = [
  // Semester 1
  { name: "Mathematics I Notes", subject: "Mathematics I", semester: "Semester 1", url: "pdfs/mathematics/NCERT-Class-10-Mathematics.pdf" },
  { name: "Physics Basics", subject: "Physics", semester: "Semester 1", url: "pdfs/science/Physics-NCERT-Class-11.pdf" },

  // Semester 2
  { name: "Mathematics II", subject: "Mathematics II", semester: "Semester 2", url: "pdfs/mathematics/RD-Sharma-Class-12.pdf" },
  { name: "Data Structures", subject: "Data Structures", semester: "Semester 2", url: "pdfs/cse/Data-Structures.pdf" },

  // Semester 3
  { name: "Operating Systems", subject: "Operating Systems", semester: "Semester 3", url: "pdfs/cse/Operating-Systems.pdf" },
  { name: "Computer Networks", subject: "Computer Networks", semester: "Semester 3", url: "pdfs/cse/Computer-Networks.pdf" },

  // Semester 4
  { name: "Software Engineering", subject: "Software Engineering", semester: "Semester 4", url: "pdfs/cse/Software-Engineering.pdf" },

  // Semester 5
  { name: "Artificial Intelligence", subject: "Artificial Intelligence", semester: "Semester 5", url: "pdfs/cse/Artificial-Intelligence.pdf" },

  // Semester 6
  { name: "Project Management", subject: "Project Management", semester: "Semester 6", url: "pdfs/cse/Project-Management.pdf" }
];

const grid = document.getElementById("pdfGrid");
const searchInput = document.getElementById("searchInput");
const subjectFilter = document.getElementById("subjectFilter");

// Populate subject dropdown
[...new Set(pdfs.map(p => p.subject))].forEach(sub => {
  const opt = document.createElement("option");
  opt.value = sub;
  opt.textContent = sub;
  subjectFilter.appendChild(opt);
});

function render(list) {
  grid.innerHTML = "";
  const semesters = [...new Set(list.map(p => p.semester))];

  semesters.forEach(sem => {
    const title = document.createElement("div");
    title.className = "semester-title";
    title.textContent = "🎓 " + sem;
    grid.appendChild(title);

    list.filter(p => p.semester === sem).forEach(pdf => {
      const card = document.createElement("div");
      card.className = "pdf-card";
      card.innerHTML = `
        <h3>${pdf.name}</h3>
        <p>${pdf.subject}</p>
        <button onclick="openPDF('${pdf.url}')">Open PDF</button>
      `;
      grid.appendChild(card);
    });
  });
}

function openPDF(url) {
  document.getElementById("pdfFrame").src = url;
  document.getElementById("pdfModal").style.display = "block";
}

function closePDF() {
  document.getElementById("pdfModal").style.display = "none";
}

function applyFilters() {
  const q = searchInput.value.toLowerCase();
  const sub = subjectFilter.value;

  let filtered = pdfs.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.subject.toLowerCase().includes(q)
  );

  if (sub !== "all") {
    filtered = filtered.filter(p => p.subject === sub);
  }

  render(filtered);
}

searchInput.onkeyup = applyFilters;
subjectFilter.onchange = applyFilters;

render(pdfs);
