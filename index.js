const input = document.getElementById('imageInput');
const preview = document.getElementById('previewImage');
const previewName = document.getElementById('previewName');
const resultBox = document.getElementById("result");
const dropZone = document.getElementById('dropZone');
const btn = document.getElementById("extractBtn");
let currentFile = null;

dropZone.addEventListener("click", () => input.click());
dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
        previewImage(file);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
    }
});
dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
        previewImage(file);
    }
});

input.addEventListener("change", () => {
    if (input.files[0]) {
        currentFile = input.files[0];
        previewImage(input.files[0]);
    }
});

function previewImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
        preview.src = e.target.result;
        preview.classList.remove("d-none");
        previewName.textContent = file.name;
        previewName.classList.remove("d-none");
        //Preview scr
        document.getElementById("previewImageFullscreen").src=e.target.result;
    };
    reader.readAsDataURL(file);
}

function convert() {
    if(btn.innerHTML === "<span>Done!</span>") {
        resetForm();
        return;
    }
      if (!currentFile) {
        resultBox.value = "No image selected.";
        return;
      }

      btn.disabled = true;
      btn.innerHTML = "<span>Processing...</span>";

      Tesseract.recognize(currentFile, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            updateProgressBar(m.progress);
          }
          console.log(m);
        }
      })
      .then(({data: {text}}) => {
        resultBox.value = text;
        btn.classList.add("complete");
        btn.innerHTML = "<span>Done!</span>";
        btn.disabled = false;
      })
      .catch(err => {
        resultBox.value = "OCR Error: " + err.message;
        btn.disabled = false;
        btn.innerHTML = "<span>Try Again</span>";
      });
    }

    function updateProgressBar(progress) {
      const btn = document.getElementById("extractBtn");
      const progressPercentage = Math.floor(progress * 100);
      btn.style.setProperty('--progress', progressPercentage + '%');
    }

function resetForm() {
    preview.classList.add("d-none");
    previewName.classList.add("d-none");
    preview.src = "";
    input.value = "";
    resultBox.value="";
    currentFile=null;
    btn.classList.remove("complete");
    btn.style.setProperty('--progress', '0%');
    btn.style.backgroundColor = 'transparent';
    btn.style.color = '#007BFF';
    btn.innerHTML = "<span>Extract Text</span>";
    btn.disabled = false;
}

function copyText() {
    navigator.clipboard.writeText(resultBox.value)
        .then(() => { 
          alert("Text copied to clipboard!");
        })
        .catch(err => {
        alert('Failed to copy text: '+ err);
          console.error('Failed to copy text: ', err);
        });
}

function updateProgressBar(progress) {
  const progressPercentage = Math.floor(progress * 100);
  btn.style.setProperty('--progress', progressPercentage + '%');

}


//Fullscreen preview
function openPreview() {
            document.getElementById('previewOverlay').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        function closePreview() {
            document.getElementById('previewOverlay').style.display = 'none';
            document.body.style.overflow = 'visible';
        }
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closePreview();
            }
        });