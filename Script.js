const pdfData = {
  Maths: [
    {
      name: "Class 10 Maths Notes",
      url: "pdfs/mathematics/class10-maths.pdf"
    }
  ],
  Physics: [
    {
      name: "Physics Motion Notes",
      url: "pdfs/science/physics.pdf"
    }
  ]
};

const subjectSelect = document.getElementById("subjectSelect");
const documentList = document.getElementById("documentList");
const viewer = document.getElementById("viewer");
const pdfFrame = document.getElementById("pdfFrame");

subjectSelect.onchange = () => {
  const subject = subjectSelect.value;
  documentList.innerHTML = "";

  if (!pdfData[subject]) {
    documentList.innerHTML = "<p>No PDFs available</p>";
    return;
  }

  pdfData[subject].forEach(pdf => {
    const div = document.createElement("div");
    div.className = "document-item";
    div.textContent = "📄 " + pdf.name;
    div.onclick = () => openPDF(pdf.url);
    documentList.appendChild(div);
  });
};

function openPDF(url) {
  pdfFrame.src = url;
  viewer.style.display = "block";
  documentList.style.display = "none";
}

function backToList() {
  viewer.style.display = "none";
  documentList.style.display = "block";
}
