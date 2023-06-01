const firebaseConfig = {
    //   copy your firebase config informations
    apiKey: "AIzaSyBZK6ayXtL8wSLi8uJwl7nuvX36B9igTiI",
    authDomain: "contactform-20399.firebaseapp.com",
    databaseURL: "https://contactform-20399-default-rtdb.firebaseio.com",
    projectId: "contactform-20399",
    storageBucket: "contactform-20399.appspot.com",
    messagingSenderId: "927741106249",
    appId: "1:927741106249:web:0036c1c79f5120c3ccc798"
};

// initialize firebase
firebase.initializeApp(firebaseConfig);

// reference your database
var contactFormDB = firebase.database().ref("contactForm");

document.getElementById("contactForm").addEventListener("submit", submitForm);

function submitForm(e) {
    e.preventDefault();

    var address = document.getElementById("student-address").value;
    var name = document.getElementById("student-name").value;
    var cgpa = document.getElementById("student-cgpa").value;

    saveMessages(address, name, cgpa);

    document.querySelector(".alert").style.display = "block";

    setTimeout(() => {
      document.querySelector(".alert").style.display = "none";
    }, 3000);

    document.getElementById("contactForm").reset();
}

const saveMessages = (address, name, cgpa) => {
    var newContactForm = contactFormDB.push();

    newContactForm.set({
        address: address,
        name: name,
        cgpa: cgpa,
    });
};
