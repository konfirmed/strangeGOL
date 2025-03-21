const canvas = document.getElementById('gameCanvas');
const rows = 64;
const cols = 64;
const initialYear = 2023;
const targetYear2050 = 2050;
let initialPopulation = Math.floor(Math.random() * (300_000 - 200_000 + 1) + 200_000); // Random initial population between 200,000 and 300,000
let targetPopulation2050 = 377_000_000; // Target population for 2050
let currentYear = initialYear;

const ageGroups = [
    { ageRange: '0-4', percentage: 10.13, birthRate: 0.01, deathRate: 0.005 },
    { ageRange: '5-9', percentage: 8.97, birthRate: 0.0, deathRate: 0.004 },
    { ageRange: '10-14', percentage: 7.23, birthRate: 0.0, deathRate: 0.003 },
    { ageRange: '15-19', percentage: 6.68, birthRate: 0.0, deathRate: 0.002 },
    { ageRange: '20-24', percentage: 6.02, birthRate: 0.01, deathRate: 0.002 },
    { ageRange: '25-29', percentage: 5.48, birthRate: 0.01, deathRate: 0.002 },
    { ageRange: '30-34', percentage: 4.25, birthRate: 0.01, deathRate: 0.002 },
    { ageRange: '35-39', percentage: 3.29, birthRate: 0.01, deathRate: 0.003 },
    { ageRange: '40-44', percentage: 2.90, birthRate: 0.01, deathRate: 0.003 },
    { ageRange: '45-49', percentage: 2.06, birthRate: 0.0, deathRate: 0.004 },
    { ageRange: '50-54', percentage: 1.90, birthRate: 0.0, deathRate: 0.005 },
    { ageRange: '55-59', percentage: 0.93, birthRate: 0.0, deathRate: 0.006 },
    { ageRange: '60-64', percentage: 1.10, birthRate: 0.0, deathRate: 0.007 },
    { ageRange: '65-69', percentage: 0.53, birthRate: 0.0, deathRate: 0.008 },
    { ageRange: '70-74', percentage: 0.60, birthRate: 0.0, deathRate: 0.009 },
    { ageRange: '75-79', percentage: 0.26, birthRate: 0.0, deathRate: 0.01 },
    { ageRange: '80-84', percentage: 0.34, birthRate: 0.0, deathRate: 0.012 },
    { ageRange: '85+', percentage: 0.32, birthRate: 0.0, deathRate: 0.015 }
];

const maritalStatusDistribution = [0.42, 0.38, 0.10, 0.05, 0.035, 0.015]; // Single, Married, Divorced, Remarried, Widow, Widower
const occupationDistribution = ["farmer", "teacher", "engineer", "doctor", "trader", "artisan", "lawyer", "student", "N/A"];
const religionDistribution = ["christianity", "islam", "traditional", "atheist"];

const totalCells = rows * cols;
let grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({
    alive: false, age: 0, realAge: 0, sex: null, education: null, employment: null, maritalStatus: null, occupation: null, religion: null
})));
let birthRate = 0;
let deathRate = 0;
let interval;
let population = initialPopulation;

let counts = {
    under5Count: 0,
    age5to9Count: 0,
    age10to14Count: 0,
    age15to19Count: 0,
    age20to24Count: 0,
    age25to29Count: 0,
    age30to34Count: 0,
    age35to39Count: 0,
    age40to44Count: 0,
    age45to49Count: 0,
    age50to54Count: 0,
    age55to59Count: 0,
    age60to64Count: 0,
    age65to69Count: 0,
    age70to74Count: 0,
    age75to79Count: 0,
    age80to84Count: 0,
    age85plusCount: 0,
    totalCount: 0,
    singleCount: 0,
    marriedCount: 0,
    divorcedCount: 0,
    remarriedCount: 0,
    widowCount: 0,
    widowerCount: 0,
    primaryEducationCount: 0,
    secondaryEducationCount: 0,
    tertiaryEducationCount: 0,
    employedCount: 0,
    unemployedCount: 0,
    XXCount: 0,
    XYCount: 0,
    farmerCount: 0,
    teacherCount: 0,
    engineerCount: 0,
    doctorCount: 0,
    traderCount: 0,
    artisanCount: 0,
    lawyerCount: 0,
    christianityCount: 0,
    islamCount: 0,
    traditionalCount: 0,
    noneCount: 0
};

function createBoard() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `${i}-${j}`;
            cell.addEventListener('click', () => showCellDetails(i, j));
            canvas.appendChild(cell);
        }
    }
}

function initializeGrid() {
    let totalCellsAssigned = 0;
    let cellsToAssign = totalCells;
    ageGroups.forEach((group, index) => {
        let ageGroupCount = Math.floor((group.percentage / 100) * totalCells);
        if (totalCellsAssigned + ageGroupCount > totalCells) {
            ageGroupCount = totalCells - totalCellsAssigned;
        }
        for (let i = 0; i < ageGroupCount && totalCellsAssigned < totalCells; i++) {
            const x = Math.floor(Math.random() * rows);
            const y = Math.floor(Math.random() * cols);
            if (!grid[x][y].alive) {
                const sex = Math.random() < 0.5 ? 'XX' : 'XY';
                const realAge = Math.floor(Math.random() * 5) + (index * 5); // Real age within the age range
                let education = getEducation(realAge);
                let employment = getEmployment(realAge);
                let maritalStatus = getMaritalStatus(realAge);
                let occupation = getOccupation(realAge);
                const religion = religionDistribution[Math.floor(Math.random() * religionDistribution.length)];

                grid[x][y] = {
                    alive: true,
                    age: index,
                    realAge: realAge,
                    sex: sex,
                    education: education,
                    employment: employment,
                    maritalStatus: maritalStatus,
                    occupation: occupation,
                    religion: religion
                };

                counts.totalCount++;
                counts[`age${index}Count`]++;
                if (education) counts[`${education}EducationCount`]++;
                if (employment) counts[`${employment}Count`]++;
                if (maritalStatus) counts[`${maritalStatus}Count`]++;
                if (occupation) counts[`${occupation}Count`]++;
                counts[`${religion}Count`]++;
                sex === 'XX' ? counts.XXCount++ : counts.XYCount++;
                totalCellsAssigned++;
                cellsToAssign--;
            }
        }
    });

    // If there are any unassigned cells, randomly assign them to age groups to balance the grid
    while (cellsToAssign > 0) {
        const x = Math.floor(Math.random() * rows);
        const y = Math.floor(Math.random() * cols);
        if (!grid[x][y].alive) {
            const sex = Math.random() < 0.5 ? 'XX' : 'XY';
            const index = Math.floor(Math.random() * ageGroups.length);
            const realAge = Math.floor(Math.random() * 5) + (index * 5);
            let education = getEducation(realAge);
            let employment = getEmployment(realAge);
            let maritalStatus = getMaritalStatus(realAge);
            let occupation = getOccupation(realAge);
            const religion = religionDistribution[Math.floor(Math.random() * religionDistribution.length)];

            grid[x][y] = {
                alive: true,
                age: index,
                realAge: realAge,
                sex: sex,
                education: education,
                employment: employment,
                maritalStatus: maritalStatus,
                occupation: occupation,
                religion: religion
            };

            counts.totalCount++;
            counts[`age${index}Count`]++;
            if (education) counts[`${education}EducationCount`]++;
            if (employment) counts[`${employment}Count`]++;
            if (maritalStatus) counts[`${maritalStatus}Count`]++;
            if (occupation) counts[`${occupation}Count`]++;
            counts[`${religion}Count`]++;
            sex === 'XX' ? counts.XXCount++ : counts.XYCount++;
            cellsToAssign--;
        }
    }

    updateBoard();
}

function getEducation(realAge) {
    if (realAge < 5) return 'N/A';
    if (realAge >= 5 && realAge < 9) return Math.random() < 0.5 ? 'N/A' : 'primary';
    if (realAge >= 9 && realAge < 16) return Math.random() < 0.5 ? 'primary' : 'secondary';
    if (realAge >= 16 && realAge < 18) return Math.random() < 0.33 ? 'primary' : Math.random() < 0.5 ? 'secondary' : 'tertiary';
    if (realAge >= 18) return 'tertiary';
    return 'N/A';
}

function getEmployment(realAge) {
    if (realAge < 5) return 'N/A';
    if (realAge >= 5 && realAge < 18) return 'student';
    if (realAge >= 18) return Math.random() < 0.7 ? 'employed' : 'unemployed';
    return 'N/A';
}

function getMaritalStatus(realAge) {
    if (realAge < 18) return 'N/A';
    const rand = Math.random();
    if (rand < maritalStatusDistribution[0]) return 'single';
    if (rand < maritalStatusDistribution[0] + maritalStatusDistribution[1]) return 'married';
    if (rand < maritalStatusDistribution[0] + maritalStatusDistribution[1] + maritalStatusDistribution[2]) return 'divorced';
    if (rand < maritalStatusDistribution[0] + maritalStatusDistribution[1] + maritalStatusDistribution[2] + maritalStatusDistribution[3]) return 'remarried';
    if (rand < maritalStatusDistribution[0] + maritalStatusDistribution[1] + maritalStatusDistribution[2] + maritalStatusDistribution[3] + maritalStatusDistribution[4]) return 'widow';
    return 'widower';
}

function getOccupation(realAge) {
    if (realAge < 18) return 'N/A';
    return occupationDistribution[Math.floor(Math.random() * occupationDistribution.length)];
}

function updateBoard() {
    // Reset counts
    for (let key in counts) {
        counts[key] = 0;
    }

    // Update grid and counts
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.getElementById(`${i}-${j}`);
            const state = grid[i][j];
            cell.className = 'cell';
            if (state.alive) {
                counts.totalCount++;
                cell.classList.add(state.sex);
                switch (state.age) {
                    case 0:
                        cell.classList.add('under-5');
                        counts.under5Count++;
                        break;
                    case 1:
                        cell.classList.add('age-5-9');
                        counts.age5to9Count++;
                        break;
                    case 2:
                        cell.classList.add('age-10-14');
                        counts.age10to14Count++;
                        break;
                    case 3:
                        cell.classList.add('age-15-19');
                        counts.age15to19Count++;
                        break;
                    case 4:
                        cell.classList.add('age-20-24');
                        counts.age20to24Count++;
                        break;
                    case 5:
                        cell.classList.add('age-25-29');
                        counts.age25to29Count++;
                        break;
                    case 6:
                        cell.classList.add('age-30-34');
                        counts.age30to34Count++;
                        break;
                    case 7:
                        cell.classList.add('age-35-39');
                        counts.age35to39Count++;
                        break;
                    case 8:
                        cell.classList.add('age-40-44');
                        counts.age40to44Count++;
                        break;
                    case 9:
                        cell.classList.add('age-45-49');
                        counts.age45to49Count++;
                        break;
                    case 10:
                        cell.classList.add('age-50-54');
                        counts.age50to54Count++;
                        break;
                    case 11:
                        cell.classList.add('age-55-59');
                        counts.age55to59Count++;
                        break;
                    case 12:
                        cell.classList.add('age-60-64');
                        counts.age60to64Count++;
                        break;
                    case 13:
                        cell.classList.add('age-65-69');
                        counts.age65to69Count++;
                        break;
                    case 14:
                        cell.classList.add('age-70-74');
                        counts.age70to74Count++;
                        break;
                    case 15:
                        cell.classList.add('age-75-79');
                        counts.age75to79Count++;
                        break;
                    case 16:
                        cell.classList.add('age-80-84');
                        counts.age80to84Count++;
                        break;
                    case 17:
                        cell.classList.add('age-85-plus');
                        counts.age85plusCount++;
                        break;
                }

                switch (state.maritalStatus) {
                    case 'single':
                        counts.singleCount++;
                        break;
                    case 'married':
                        counts.marriedCount++;
                        break;
                    case 'divorced':
                        counts.divorcedCount++;
                        break;
                    case 'remarried':
                        counts.remarriedCount++;
                        break;
                    case 'widow':
                        counts.widowCount++;
                        break;
                    case 'widower':
                        counts.widowerCount++;
                        break;
                }

                if (state.education === 'primary') {
                    cell.classList.add('primary-education');
                    counts.primaryEducationCount++;
                } else if (state.education === 'secondary') {
                    cell.classList.add('secondary-education');
                    counts.secondaryEducationCount++;
                } else if (state.education === 'tertiary') {
                    cell.classList.add('tertiary-education');
                    counts.tertiaryEducationCount++;
                }
                if (state.employment === 'employed') {
                    cell.classList.add('employed');
                    counts.employedCount++;
                } else {
                    cell.classList.add('unemployed');
                    counts.unemployedCount++;
                }

                switch (state.occupation) {
                    case 'farmer':
                        counts.farmerCount++;
                        break;
                    case 'teacher':
                        counts.teacherCount++;
                        break;
                    case 'engineer':
                        counts.engineerCount++;
                        break;
                    case 'doctor':
                        counts.doctorCount++;
                        break;
                    case 'trader':
                        counts.traderCount++;
                        break;
                    case 'artisan':
                        counts.artisanCount++;
                        break;
                    case 'lawyer':
                        counts.lawyerCount++;
                        break;
                }

                switch (state.religion) {
                    case 'christianity':
                        counts.christianityCount++;
                        break;
                    case 'islam':
                        counts.islamCount++;
                        break;
                    case 'traditional':
                        counts.traditionalCount++;
                        break;
                    case 'atheist':
                        counts.noneCount++;
                        break;
                }

                state.sex === 'XX' ? counts.XXCount++ : counts.XYCount++;
            }
        }
    }

    document.getElementById('under5Count').innerText = counts.under5Count;
    document.getElementById('age5to9Count').innerText = counts.age5to9Count;
    document.getElementById('age10to14Count').innerText = counts.age10to14Count;
    document.getElementById('age15to19Count').innerText = counts.age15to19Count;
    document.getElementById('age20to24Count').innerText = counts.age20to24Count;
    document.getElementById('age25to29Count').innerText = counts.age25to29Count;
    document.getElementById('age30to34Count').innerText = counts.age30to34Count;
    document.getElementById('age35to39Count').innerText = counts.age35to39Count;
    document.getElementById('age40to44Count').innerText = counts.age40to44Count;
    document.getElementById('age45to49Count').innerText = counts.age45to49Count;
    document.getElementById('age50to54Count').innerText = counts.age50to54Count;
    document.getElementById('age55to59Count').innerText = counts.age55to59Count;
    document.getElementById('age60to64Count').innerText = counts.age60to64Count;
    document.getElementById('age65to69Count').innerText = counts.age65to69Count;
    document.getElementById('age70to74Count').innerText = counts.age70to74Count;
    document.getElementById('age75to79Count').innerText = counts.age75to79Count;
    document.getElementById('age80to84Count').innerText = counts.age80to84Count;
    document.getElementById('age85plusCount').innerText = counts.age85plusCount;
    document.getElementById('totalCount').innerText = counts.totalCount;
    document.getElementById('birthRate').innerText = birthRate;
    document.getElementById('deathRate').innerText = deathRate;
    document.getElementById('singleCount').innerText = counts.singleCount;
    document.getElementById('marriedCount').innerText = counts.marriedCount;
    document.getElementById('divorcedCount').innerText = counts.divorcedCount;
    document.getElementById('remarriedCount').innerText = counts.remarriedCount;
    document.getElementById('widowCount').innerText = counts.widowCount;
    document.getElementById('widowerCount').innerText = counts.widowerCount;
    document.getElementById('primaryEducationCount').innerText = counts.primaryEducationCount;
    document.getElementById('secondaryEducationCount').innerText = counts.secondaryEducationCount;
    document.getElementById('tertiaryEducationCount').innerText = counts.tertiaryEducationCount;
    document.getElementById('employedCount').innerText = counts.employedCount;
    document.getElementById('unemployedCount').innerText = counts.unemployedCount;
    document.getElementById('XXCount').innerText = counts.XXCount;
    document.getElementById('XYCount').innerText = counts.XYCount;
    document.getElementById('farmerCount').innerText = counts.farmerCount;
    document.getElementById('teacherCount').innerText = counts.teacherCount;
    document.getElementById('engineerCount').innerText = counts.engineerCount;
    document.getElementById('doctorCount').innerText = counts.doctorCount;
    document.getElementById('traderCount').innerText = counts.traderCount;
    document.getElementById('artisanCount').innerText = counts.artisanCount;
    document.getElementById('lawyerCount').innerText = counts.lawyerCount;
    document.getElementById('christianityCount').innerText = counts.christianityCount;
    document.getElementById('islamCount').innerText = counts.islamCount;
    document.getElementById('traditionalCount').innerText = counts.traditionalCount;
    document.getElementById('noneCount').innerText = counts.noneCount;
    document.getElementById('currentYear').innerText = currentYear;
}

function getNextState(grid) {
    const nextGrid = grid.map(arr => arr.map(cell => ({ ...cell })));
    birthRate = 0;
    deathRate = 0;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const state = grid[i][j];
            
            if (state.alive) {
                state.realAge++; // Increment the real age
                if (Math.random() < 0.1) { // Random aging factor
                    state.age = Math.floor(state.realAge / 5); // Update age group based on real age
                    if (state.age < ageGroups.length && Math.random() < ageGroups[state.age].deathRate) { // Death probability based on age group
                        nextGrid[i][j].alive = false; // Cell dies
                        deathRate++;
                    } else {
                        nextGrid[i][j].education = getEducation(state.realAge);
                        nextGrid[i][j].employment = getEmployment(state.realAge);
                        nextGrid[i][j].maritalStatus = getMaritalStatus(state.realAge);
                        nextGrid[i][j].occupation = getOccupation(state.realAge);
                    }
                }
            }
            
            if (!nextGrid[i][j].alive) {
                nextGrid[i][j].alive = true; // Respawn a new cell
                nextGrid[i][j].age = 0; // New cell starts as an infant
                nextGrid[i][j].realAge = 0; // Reset real age
                nextGrid[i][j].sex = Math.random() < 0.5 ? 'XX' : 'XY';
                nextGrid[i][j].education = getEducation(nextGrid[i][j].realAge);
                nextGrid[i][j].employment = getEmployment(nextGrid[i][j].realAge);
                nextGrid[i][j].maritalStatus = getMaritalStatus(nextGrid[i][j].realAge);
                nextGrid[i][j].occupation = getOccupation(nextGrid[i][j].realAge);
                nextGrid[i][j].religion = religionDistribution[Math.floor(Math.random() * religionDistribution.length)];
                birthRate++;
            }
        }
    }

    return nextGrid;
}

function updatePopulationGrowth() {
    const totalYears = targetYear2050 - initialYear;
    const growthRate = Math.pow(targetPopulation2050 / initialPopulation, 1 / totalYears);

    population *= growthRate;
    currentYear++;
    document.getElementById('currentYear').innerText = currentYear;
}

function update() {
    grid = getNextState(grid);
    updateBoard();
    updatePopulationGrowth();
}

document.getElementById('pauseButton').addEventListener('click', () => {
    clearInterval(interval);
});

document.getElementById('resumeButton').addEventListener('click', () => {
    interval = setInterval(update, 100);
});

function startSimulation() {
    createBoard();
    initializeGrid();
    updateBoard();
    interval = setInterval(update, 100);
}

startSimulation();

function getAgeRange(index) {
    const ageRanges = [
        '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39',
        '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79',
        '80-84', '85+'
    ];
    return ageRanges[index] || 'Unknown';
}

function showCellDetails(x, y) {
    const cell = grid[x][y];
    const ageRange = getAgeRange(cell.age);
    alert(`Cell Details:
    Age: ${cell.realAge} (Age Group: ${ageRange})
    Sex: ${cell.sex}
    Education: ${cell.education ? cell.education : 'N/A'}
    Employment: ${cell.employment ? cell.employment : 'N/A'}
    Marital Status: ${cell.maritalStatus ? cell.maritalStatus : 'N/A'}
    Occupation: ${cell.occupation ? cell.occupation : 'N/A'}
    Religion: ${cell.religion}`);
}
