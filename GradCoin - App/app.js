import Web3 from "web3";
import 'bootstrap/dist/css/bootstrap.css';
import configuration from './GradCoin.json';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: 'toast-bottom-right',
    preventDuplicates: false,
    onclick: null,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut',
    toastClass: 'my-toast'
};

const contract_address = configuration.networks['5'].address;
const contract_abi = configuration.abi;
// const port = process.env.PORT || 7545; // for Heroku, otherwise remove this line and mention 7545 instead of $port

const web3 = new Web3(
    Web3.givenProvider || `http://127.0.0.1:7545`
  );

const contract = new web3.eth.Contract(contract_abi, contract_address);
let account;
const accountEl = document.getElementById('account');

const main = async() =>{
    const accounts = await web3.eth.requestAccounts();
    account = accounts[0];
    accountEl.innerText = account;
};

main();

const gasPriceWei = web3.utils.toWei('0','gwei');
const gasLimit = 4000000;

const transferButton = document.getElementById("transfer");
transferButton.addEventListener('click', async () => {
    const address = document.getElementById("student-address").value;
    const name = document.getElementById("student-name").value;
    const cgpa = document.getElementById("student-cgpa").value;
    try {
        // call the GradCoinTransfer function in the smart contract
        await transferTokens(address, name, cgpa);

        // display a success message
        toastr.success(`Successfully transferred GradCoins to ${name}: ${address}.`)
        console.log(`Successfully transferred GradCoins to ${name}: ${address}.`);
    } catch (error) {
        // display an error message
        toastr.error(`Failed to transfer GradCoins: ${error}`);
        console.error(`Failed to transfer GradCoins: ${error}`);
    }
});

const studentAddresses = [];
const students = {};
let highestCGPA = 0;
let totalCGPA = 0;
let numStudents = 0;

async function transferTokens(address, name, cgpa) {
    try {
        if (!studentAddresses.includes(address)) {
            // add student to the 'students' object
            students[address] = {
                name: name,
                cgpa: cgpa
            };
            studentAddresses.push(address);

            // update the highest CGPA seen so far
            if (cgpa > highestCGPA) {
                highestCGPA = cgpa;
            }
            // update the running total of CGPAs and the number of students
            totalCGPA += cgpa;
            if (totalCGPA > 0) {
                numStudents++;
            }
        }
        // call the GradCoinTransfer function in the smart contract
        await contract.methods.GradCoinTransfer(name, address, cgpa).send({ from: account, gas: gasLimit });
    } catch (error) {
        throw error;
    }
}

const showTopPerformerButton = document.getElementById("top");
const topPerformerField = document.getElementById("top-performer-field");

showTopPerformerButton.addEventListener('click', async () => {
    try {
        for (let i = 0; i < studentAddresses.length; i++) {
            const studentAddress = studentAddresses[i];
            const cgpa = students[studentAddress].cgpa;
            if (cgpa > highestCGPA) {
                highestCGPA = cgpa;
            }
        }
        const topPerformers = [];

        for (let i = 0; i < studentAddresses.length; i++) {
            const studentAddress = studentAddresses[i];
            const cgpa = students[studentAddress].cgpa;
            const name = students[studentAddress].name;
            if (cgpa === highestCGPA) {
                topPerformers.push(`${name} = (${cgpa})`);
            }
        }

        if (topPerformers.length === 1) {
            topPerformerField.value = topPerformers[0];
            console.log(`The top performer is ${topPerformers[0]}.`);
        } else if (topPerformers.length > 1) {
            topPerformerField.value = `${topPerformers.join(", ")}`;
            toastr.info(`There are ${topPerformers.length} top performers: ${topPerformers.join(", ")}.`);
            console.log(`There are ${topPerformers.length} top performers: ${topPerformers.join(", ")}.`);
        } else {
            toastr.error(`Failed to get the top performer: no students found.`);
            console.error(`Failed to get the top performer: no students found.`);
        }
    } catch (error) {
        toastr.error(`Failed to get the top performer: ${error}`);
        console.error(`Failed to get the top performer: ${error}`);
    }
})


async function getCurrentHighestCGPA() {
    try {
        let currentHighestCGPA = 0;
        for (let i = 0; i < studentAddresses.length; i++) {
            const studentAddress = studentAddresses[i];
            const cgpa = students[studentAddress].cgpa;
            if (cgpa > currentHighestCGPA) {
                currentHighestCGPA = cgpa;
            }
        }
        return currentHighestCGPA;
    } catch (error) {
        throw error;
    }
}

const highestCGPAButton = document.getElementById("highest");
const highestCGPAField = document.getElementById("highest-cgpa-field");
highestCGPAButton.addEventListener('click', async () => {
    try {
        const highestCGPA = await getCurrentHighestCGPA();
        highestCGPAField.value = highestCGPA;
        toastr.info(`The highest GPA of the class is ${highestCGPA}.`);
        console.log(`The top performer is with a CGPA of ${highestCGPA}.`);
    } catch (error) {
        toastr.error(`Failed to get highest CGPA: ${error}`);
        console.error(`Failed to get highest CGPA: ${error}`);
    }
});

async function getAverageCGPA() {
    try {
        if (numStudents === 0) {
            // return null if there are no students
            return null;
        }
        const recentStudents = studentAddresses.slice(-numStudents);
        console.log(`Recent students: ${JSON.stringify(recentStudents)}`);
        const totalRecentCGPA = recentStudents.reduce((total, address) => total + parseFloat(students[address].cgpa), 0);
        const avgCGPA = totalRecentCGPA / recentStudents.length;
        return avgCGPA;
    } catch (error) {
        throw error;
    }
}

const avgButton = document.getElementById("avg");
const avgField = document.getElementById("average-cgpa-field");

avgButton.addEventListener('click', async () => {
    try {
        const avgCGPA = await getAverageCGPA();
        if (avgCGPA === null) {
            avgField.value = 'N/A';
        } else {
            avgField.value = avgCGPA;
        }
        toastr.info(`The average CGPA is ${avgCGPA}.`);
        console.log(`The average CGPA is ${avgCGPA}.`);
    } catch (error) {
        toastr.error(`Failed to get the average CGPA: ${error}`);
        console.error(`Failed to get the average CGPA: ${error}`);
    }
})

const balanceButton = document.getElementById("balance");
balanceButton.addEventListener('click', async () => {
    const ethAddressField = document.getElementById("student-eth-address-field");
    const balanceField = document.getElementById("student-balance-field");
    const studentAddress = ethAddressField.value;

    try {
        // call the getStudentBalance function in the smart contract
        const balance = await contract.methods.getStudentBalance(studentAddress).call();

        // display the balance of the student
        balanceField.value = balance/ 10**14 + " " + "GC";
    } catch (error) {
        // display an error message
        toastr.error(`Failed to retrieve student balance: ${error}`);
        console.error(`Failed to retrieve student balance: ${error}`);
    }
});
