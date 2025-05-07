// Use consistent version for all Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmhb4kGKFX_B4PNVmhlFfKZ0tL1oigi9E",
  authDomain: "telu-5ad31.firebaseapp.com",
  projectId: "telu-5ad31",
  storageBucket: "telu-5ad31.firebasestorage.app",
  messagingSenderId: "868265845966",
  appId: "1:868265845966:web:aa02226a7a841657375c9f",
  measurementId: "G-3GJB7YDBZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const teamColRef = collection(db, 'teams');

// DOM Elements
const imageInput = document.getElementById('teamLogo');
const preview = document.getElementById('logoPreview');
const errorP = document.getElementById('errorP');
const spinner = document.getElementById('spinner');
const submitBTN = document.getElementById('submitBTN');
const signUpForm = document.getElementById('signUpForm');

// Image Preview
imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = '';
    preview.style.display = 'none';
    alert("Please select a valid image file (jpg, png, etc).");
  }
});

async function createTeamAccount(e) {
  spinner.classList.remove("d-none");
  submitBTN.disabled = true;
  errorP.textContent = "";
  e.preventDefault();

  const file = imageInput.files[0];
  const reader = new FileReader();

  reader.onloadend = async function () {
      const teamDetails = {
          name: signUpForm.teamName.value.trim(),
          email: signUpForm.email.value.trim(),
          password: signUpForm.password.value.trim(),
          confirmPassword: signUpForm.confirmPassword.value.trim(),
          image: reader.result,
          // checkbox: signUpForm.terms.checked,
          emailVerified: false,
          createdAt: new Date().toISOString()
      };

      let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

      // Validate email
      if (!emailRegex.test(teamDetails.email)) {
          errorP.textContent = "*Invalid email address";
          spinner.classList.add("d-none");
          submitBTN.disabled = false;
          return;
      }

      // Validate password length
      if (teamDetails.password.length < 6) {
          errorP.textContent = "*Password should be at least 6 characters";
          spinner.classList.add("d-none");
          submitBTN.disabled = false;
          return;
      }

      // Check if passwords match
      if (teamDetails.password !== teamDetails.confirmPassword) {
          errorP.textContent = "*Passwords do not match";
          spinner.classList.add("d-none");
          submitBTN.disabled = false;
          return;
      }

      try {
          const { password, confirmPassword, ...details } = teamDetails;

          // Create a new user with Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(auth, details.email, password);
          const user = userCredential.user;
          
          // Send email verification
          await sendEmailVerification(user);
          
          // Save user data to Firestore
          await setDoc(doc(db, "teams", user.uid), details);

          // Show success message with verification info
          Swal.fire({
              title: 'Account Created!',
              html: `We've sent a verification email to <strong>${teamDetails.email}</strong>. 
                     Please check your inbox and verify your email address.`,
              icon: 'success',
              confirmButtonColor: '#2EC4B6'
          }).then(() => {
              signUpForm.reset();
              imagePreview.classList.add("d-none");
              window.location.href = "./under-15-log-in.html";
          });
          
      } catch (error) {
          console.error("Signup error:", error);
          if (error.code === "auth/email-already-in-use") {
              errorP.textContent = "Email already exists";
          } else {
              errorP.textContent = error.message;
          }
      } finally {
          spinner.classList.add("d-none");
          submitBTN.disabled = false;
      }
  };

  // If file is provided, load it, else directly execute onloadend
  if (file) {
      reader.readAsDataURL(file);
  } else {
      reader.onloadend();
  }
};

// Add event listener to form submission
signUpForm.addEventListener("submit", createTeamAccount);

// Password toggle visibility
// document.getElementById('togglePassword').addEventListener('click', function() {
//   const password = document.getElementById('password');
//   const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
//   password.setAttribute('type', type);
//   this.classList.toggle('bi-eye');
//   this.classList.toggle('bi-eye-slash');
// });

// document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
//   const password = document.getElementById('confirmPassword');
//   const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
//   password.setAttribute('type', type);
//   this.classList.toggle('bi-eye');
//   this.classList.toggle('bi-eye-slash');
// });

// Image preview
document.getElementById('teamLogo').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
          const preview = document.getElementById('logoPreview');
          preview.src = event.target.result;
          preview.classList.remove('d-none');
      }
      reader.readAsDataURL(file);
  }
});
