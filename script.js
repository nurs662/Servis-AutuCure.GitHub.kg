/* =========================================================
   AUTOCARE
   Основной JavaScript
   ========================================================= */


/* =========================================================
   НАСТРОЙКИ
========================================================= */

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "nurs2008";

const WHATSAPP_NUMBER = "996553999045";


/* =========================================================
   ХРАНИЛИЩЕ
========================================================= */

let users = JSON.parse(
    localStorage.getItem("autocare_users")
) || [];

let currentUser = JSON.parse(
    localStorage.getItem("autocare_current_user")
) || null;

let cars = JSON.parse(
    localStorage.getItem("autocare_cars")
) || [];

let appointments = JSON.parse(
    localStorage.getItem("autocare_appointments")
) || [];


/* =========================================================
   МИГРАЦИЯ СТАРЫХ ДАННЫХ
========================================================= */

function migrateOldData() {

    /*
     * Если в старой версии был autocare_user,
     * переносим его в новый массив пользователей.
     */

    const oldUser = localStorage.getItem("autocare_user");

    if (oldUser && users.length === 0) {

        try {

            const parsedUser = JSON.parse(oldUser);

            if (
                parsedUser &&
                parsedUser.email
            ) {

                users.push({
                    id: parsedUser.id || Date.now(),
                    name: parsedUser.name || "Клиент",
                    email: parsedUser.email,
                    password: parsedUser.password || ""
                });

                saveUsers();
            }

        } catch (error) {

            console.log(
                "Старые данные пользователя не удалось перенести."
            );

        }
    }
}


/* =========================================================
   СОХРАНЕНИЕ
========================================================= */

function saveUsers() {

    localStorage.setItem(
        "autocare_users",
        JSON.stringify(users)
    );
}


function saveCurrentUser() {

    if (currentUser) {

        localStorage.setItem(
            "autocare_current_user",
            JSON.stringify(currentUser)
        );

    } else {

        localStorage.removeItem(
            "autocare_current_user"
        );
    }
}


function saveCars() {

    localStorage.setItem(
        "autocare_cars",
        JSON.stringify(cars)
    );
}


function saveAppointments() {

    localStorage.setItem(
        "autocare_appointments",
        JSON.stringify(appointments)
    );
}


/* =========================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getInitials(name) {

    if (!name) {
        return "U";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join("");
}


function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date = new Date(
        `${dateString}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function formatDateTime(date, time) {

    if (!date) {
        return "—";
    }

    return `${formatDate(date)}${time ? " • " + time : ""}`;
}


/* =========================================================
   ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
========================================================= */

function isAdmin() {

    return (
        currentUser &&
        currentUser.role === "admin"
    );
}


function isLoggedIn() {

    return !!currentUser;
}


function getUserCars() {

    if (!currentUser || isAdmin()) {
        return [];
    }

    return cars.filter(
        car => car.ownerEmail === currentUser.email
    );
}


function getUserAppointments() {

    if (!currentUser || isAdmin()) {
        return [];
    }

    return appointments.filter(
        appointment =>
            appointment.ownerEmail === currentUser.email
    );
}


/* =========================================================
   DOM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        migrateOldData();

        setupForms();

        setupModals();

        setupMobileMenu();

        setupNavigation();

        setMinimumDate();

        updateUI();

    }
);


/* =========================================================
   ФОРМЫ
========================================================= */

function setupForms() {

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            handleRegister
        );

    }


    const carForm =
        document.getElementById("carForm");

    if (carForm) {

        carForm.addEventListener(
            "submit",
            handleCarSubmit
        );

    }


    const bookingForm =
        document.getElementById("bookingForm");

    if (bookingForm) {

        bookingForm.addEventListener(
            "submit",
            handleBookingSubmit
        );

    }


    const whatsappButton =
        document.querySelector(
            "[data-success-whatsapp]"
        );

    if (whatsappButton) {

        whatsappButton.addEventListener(
            "click",
            function () {

                const whatsappLink =
                    localStorage.getItem(
                        "autocare_last_whatsapp"
                    );

                if (whatsappLink) {

                    window.open(
                        whatsappLink,
                        "_blank"
                    );

                } else {

                    alert(
                        "Сначала создайте заявку."
                    );

                }

            }
        );

    }

}


/* =========================================================
   РЕГИСТРАЦИЯ
========================================================= */

function handleRegister(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("registerPassword")
            .value;


    if (!name || !email || !password) {

        alert(
            "Заполните все поля."
        );

        return;
    }


    if (password.length < 6) {

        alert(
            "Пароль должен содержать минимум 6 символов."
        );

        return;
    }


    if (email === ADMIN_EMAIL) {

        alert(
            "Этот email зарезервирован для администратора."
        );

        return;
    }


    const existingUser =
        users.find(
            user =>
                user.email.toLowerCase() === email
        );


    if (existingUser) {

        alert(
            "Пользователь с таким email уже существует."
        );

        return;
    }


    const newUser = {

        id: Date.now(),

        name,

        email,

        password,

        role: "client",

        createdAt:
            new Date().toISOString()

    };


    users.push(newUser);

    saveUsers();


    currentUser = {

        id: newUser.id,

        name: newUser.name,

        email: newUser.email,

        role: "client"

    };

    saveCurrentUser();


    closeModal("registerModal");


    event.target.reset();


    updateUI();


    alert(
        `Добро пожаловать, ${name}!`
    );


    setTimeout(
        function () {

            document
                .getElementById("garage")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        },
        100
    );

}


/* =========================================================
   ВХОД
========================================================= */

function handleLogin(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("loginPassword")
            .value;


    /* -----------------------------------------
       АДМИНИСТРАТОР
    ----------------------------------------- */

    if (
        email === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
    ) {

        currentUser = {

            id: "admin",

            name: "Администратор",

            email: ADMIN_EMAIL,

            role: "admin"

        };


        saveCurrentUser();

        closeModal("loginModal");

        event.target.reset();

        updateUI();

        renderAdminPanel();


        setTimeout(
            function () {

                document
                    .getElementById("adminPanel")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            },
            100
        );


        return;
    }


    /* -----------------------------------------
       ОБЫЧНЫЙ ПОЛЬЗОВАТЕЛЬ
    ----------------------------------------- */

    const user =
        users.find(
            item =>
                item.email.toLowerCase() === email &&
                item.password === password
        );


    if (!user) {

        alert(
            "Неверный email или пароль."
        );

        return;
    }


    currentUser = {

        id: user.id,

        name: user.name,

        email: user.email,

        role: "client"

    };


    saveCurrentUser();


    closeModal("loginModal");

    event.target.reset();

    updateUI();


    alert(
        `С возвращением, ${user.name}!`
    );

}


/* =========================================================
   ВЫХОД
========================================================= */

function logout() {

    currentUser = null;

    saveCurrentUser();

    updateUI();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   ОБНОВЛЕНИЕ UI
========================================================= */

function updateUI() {

    const loginButton =
        document.getElementById("loginButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const profileName =
        document.getElementById("profileName");

    const adminPanel =
        document.getElementById("adminPanel");


    if (currentUser) {

        if (loginButton) {
            loginButton.style.display = "none";
        }

        if (logoutButton) {
            logoutButton.style.display = "inline-flex";
        }

        if (profileName) {

            profileName.textContent =
                isAdmin()
                    ? "Администратор"
                    : currentUser.name;

        }

    } else {

        if (loginButton) {
            loginButton.style.display = "inline-flex";
        }

        if (logoutButton) {
            logoutButton.style.display = "none";
        }

        if (profileName) {
            profileName.textContent = "";
        }

    }


    if (adminPanel) {

        adminPanel.style.display =
            isAdmin()
                ? "block"
                : "none";

    }


    renderGarage();

    renderAppointments();

    renderHistory();

    populateBookingCars();


    if (isAdmin()) {

        renderAdminPanel();

    }

}


/* =========================================================
   ГАРАЖ
========================================================= */

function renderGarage() {

    const container =
        document.getElementById(
            "garageContainer"
        );

    if (!container) {
        return;
    }


    if (!currentUser) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🚗
                </div>

                <h3>
                    Войдите в аккаунт
                </h3>

                <p>
                    Чтобы добавить автомобиль
                    и записаться на обслуживание.
                </p>

                <button
                    class="btn btn-primary"
                    onclick="openModal('loginModal')"
                >
                    Войти
                </button>

            </div>

        `;

        return;
    }


    if (isAdmin()) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    👑
                </div>

                <h3>
                    Вы вошли как администратор
                </h3>

                <p>
                    Все автомобили клиентов
                    находятся в панели администратора.
                </p>

            </div>

        `;

        return;
    }


    const userCars =
        getUserCars();


    if (userCars.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🚗
                </div>

                <h3>
                    Гараж пока пуст
                </h3>

                <p>
                    Добавьте свой автомобиль,
                    чтобы записать его на обслуживание.
                </p>

                <button
                    class="btn btn-primary"
                    onclick="openModal('carModal')"
                >
                    + Добавить автомобиль
                </button>

            </div>

        `;

        return;
    }


    container.innerHTML =
        userCars
            .map(
                car =>
                    createCarCard(car)
            )
            .join("");

}


function createCarCard(car) {

    return `

        <article class="car-card">

            <div class="car-card-header">

                <div class="car-icon">
                    🚗
                </div>

                <div>

                    <h3>
                        ${escapeHTML(car.make)}
                        ${escapeHTML(car.model)}
                    </h3>

                    <span>
                        ${escapeHTML(car.year)}
                    </span>

                </div>

            </div>


            <div class="car-info">

                <div class="car-info-row">

                    <span>
                        Цвет
                    </span>

                    <strong>
                        ${escapeHTML(car.color)}
                    </strong>

                </div>


                <div class="car-info-row">

                    <span>
                        Госномер
                    </span>

                    <strong>
                        ${escapeHTML(car.plate)}
                    </strong>

                </div>


                <div class="car-info-row">

                    <span>
                        Пробег
                    </span>

                    <strong>
                        ${Number(car.mileage || 0).toLocaleString("ru-RU")}
                        км
                    </strong>

                </div>


                <div class="car-info-row">

                    <span>
                        ID автомобиля
                    </span>

                    <strong>
                        #${car.id}
                    </strong>

                </div>

            </div>


            <div class="car-problem">

                <strong>
                    Проблема / жалоба
                </strong>

                <p>
                    ${escapeHTML(
                        car.problem || "Не указана"
                    )}
                </p>

            </div>


            ${
                car.info
                    ? `
                        <div
                            class="car-problem"
                        >

                            <strong>
                                Дополнительно
                            </strong>

                            <p>
                                ${escapeHTML(car.info)}
                            </p>

                        </div>
                    `
                    : ""
            }


            <div class="car-card-actions">

                <button
                    class="btn btn-primary"
                    onclick="bookCar(${car.id})"
                >
                    📅 Записаться
                </button>

                <button
                    class="btn btn-outline"
                    onclick="deleteCar(${car.id})"
                >
                    Удалить
                </button>

            </div>

        </article>

    `;
}


/* =========================================================
   ДОБАВЛЕНИЕ АВТОМОБИЛЯ
========================================================= */

function handleCarSubmit(event) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "Сначала войдите в аккаунт."
        );

        closeModal("carModal");

        openModal("loginModal");

        return;
    }


    if (isAdmin()) {

        alert(
            "Администратор не может добавлять автомобиль в клиентский гараж."
        );

        return;
    }


    const make =
        document
            .getElementById("carMake")
            .value
            .trim();

    const model =
        document
            .getElementById("carModel")
            .value
            .trim();

    const year =
        Number(
            document
                .getElementById("carYear")
                .value
        );

    const color =
        document
            .getElementById("carColor")
            .value
            .trim();

    const plate =
        document
            .getElementById("carPlate")
            .value
            .trim();

    const mileage =
        Number(
            document
                .getElementById("carMileage")
                .value
        );

    const problem =
        document
            .getElementById("carProblem")
            .value
            .trim();

    const info =
        document
            .getElementById("carInfo")
            .value
            .trim();


    if (!make || !model || !color || !plate || !problem) {

        alert(
            "Заполните обязательные поля."
        );

        return;
    }


    if (mileage < 0) {

        alert(
            "Пробег не может быть отрицательным."
        );

        return;
    }


    const newCar = {

        id: Date.now(),

        ownerEmail:
            currentUser.email,

        ownerName:
            currentUser.name,

        make,

        model,

        year,

        color,

        plate,

        mileage,

        problem,

        info,

        createdAt:
            new Date().toISOString()

    };


    cars.push(newCar);

    saveCars();


    event.target.reset();

    closeModal("carModal");

    renderGarage();

    populateBookingCars();


    alert(
        "Автомобиль успешно добавлен в гараж!"
    );

}


/* =========================================================
   УДАЛЕНИЕ АВТОМОБИЛЯ
========================================================= */

function deleteCar(carId) {

    if (!currentUser || isAdmin()) {
        return;
    }


    const car =
        cars.find(
            item => item.id === carId
        );


    if (!car) {
        return;
    }


    if (
        car.ownerEmail !==
        currentUser.email
    ) {

        alert(
            "У вас нет доступа к этому автомобилю."
        );

        return;
    }


    const hasAppointments =
        appointments.some(
            appointment =>
                appointment.carId === carId &&
                appointment.ownerEmail === currentUser.email &&
                appointment.status !== "Завершена" &&
                appointment.status !== "Отменена"
        );


    if (hasAppointments) {

        alert(
            "Нельзя удалить автомобиль, у которого есть активная запись."
        );

        return;
    }


    const confirmed =
        confirm(
            `Удалить автомобиль ${car.make} ${car.model}?`
        );


    if (!confirmed) {
        return;
    }


    cars =
        cars.filter(
            item => item.id !== carId
        );


    saveCars();

    renderGarage();

    populateBookingCars();

}


/* =========================================================
   ЗАПИСЬ НА ОБСЛУЖИВАНИЕ
========================================================= */

function openBooking() {

    if (!currentUser) {

        alert(
            "Для записи сначала войдите в аккаунт."
        );

        openModal("loginModal");

        return;
    }


    if (isAdmin()) {

        alert(
            "Администратор не может создавать клиентскую запись."
        );

        return;
    }


    const userCars =
        getUserCars();


    if (userCars.length === 0) {

        alert(
            "Сначала добавьте автомобиль в раздел «Мой гараж»."
        );


        document
            .getElementById("garage")
            ?.scrollIntoView({
                behavior: "smooth"
            });


        setTimeout(
            () => openModal("carModal"),
            500
        );

        return;
    }


    populateBookingCars();

    setMinimumDate();

    openModal("bookingModal");

}


function bookCar(carId) {

    if (!currentUser) {

        openModal("loginModal");

        return;
    }


    if (isAdmin()) {

        alert(
            "Администратор не создаёт клиентские записи."
        );

        return;
    }


    populateBookingCars();


    const bookingCar =
        document.getElementById(
            "bookingCar"
        );


    if (bookingCar) {

        bookingCar.value =
            String(carId);

    }


    openModal("bookingModal");

}


/* =========================================================
   СПИСОК АВТОМОБИЛЕЙ В ФОРМЕ
========================================================= */

function populateBookingCars() {

    const select =
        document.getElementById(
            "bookingCar"
        );

    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Выберите автомобиль
        </option>
    `;


    if (!currentUser || isAdmin()) {
        return;
    }


    const userCars =
        getUserCars();


    userCars.forEach(
        car => {

            const option =
                document.createElement("option");


            option.value =
                car.id;


            option.textContent =
                `${car.make} ${car.model} — ${car.plate}`;


            select.appendChild(option);

        }
    );

}


/* =========================================================
   СОЗДАНИЕ ЗАПИСИ
========================================================= */

function handleBookingSubmit(event) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "Сначала войдите в аккаунт."
        );

        closeModal("bookingModal");

        openModal("loginModal");

        return;
    }


    if (isAdmin()) {

        alert(
            "Администратор не может создавать клиентские записи."
        );

        return;
    }


    const carId =
        Number(
            document
                .getElementById("bookingCar")
                .value
        );

    const service =
        document
            .getElementById("bookingService")
            .value;

    const date =
        document
            .getElementById("bookingDate")
            .value;

    const time =
        document
            .getElementById("bookingTime")
            .value;

    const complaint =
        document
            .getElementById("bookingComplaint")
            .value
            .trim();


    if (!carId || !service || !date || !time) {

        alert(
            "Заполните все обязательные поля."
        );

        return;
    }


    const car =
        cars.find(
            item =>
                item.id === carId &&
                item.ownerEmail === currentUser.email
        );


    if (!car) {

        alert(
            "Автомобиль не найден."
        );

        return;
    }


    /* -----------------------------------------
       ПРОВЕРКА ПРОШЕДШЕЙ ДАТЫ
    ----------------------------------------- */

    const selectedDateTime =
        new Date(
            `${date}T${time}`
        );

    const now =
        new Date();


    if (
        Number.isNaN(
            selectedDateTime.getTime()
        )
    ) {

        alert(
            "Неверная дата или время."
        );

        return;
    }


    if (selectedDateTime < now) {

        alert(
            "Нельзя записаться на прошедшее время."
        );

        return;
    }


    /* -----------------------------------------
       ПРОВЕРКА ДУБЛЯ
    ----------------------------------------- */

    const duplicate =
        appointments.some(
            appointment =>
                appointment.ownerEmail === currentUser.email &&
                appointment.carId === carId &&
                appointment.date === date &&
                appointment.time === time &&
                appointment.status !== "Отменена"
        );


    if (duplicate) {

        alert(
            "У вас уже есть запись на это время."
        );

        return;
    }


    /* -----------------------------------------
       СОЗДАЁМ ЗАПИСЬ
    ----------------------------------------- */

    const appointment = {

        id: Date.now(),

        ownerEmail:
            currentUser.email,

        ownerName:
            currentUser.name,

        carId:
            car.id,

        carName:
            `${car.make} ${car.model}`,

        plate:
            car.plate,

        color:
            car.color,

        mileage:
            car.mileage,

        service,

        date,

        time,

        complaint:
            complaint || car.problem || "",

        status:
            "Ожидает подтверждения",

        stage:
            0,

        stageName:
            "Заявка отправлена",

        master:
            "",

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    appointments.push(
        appointment
    );

    saveAppointments();


    /* -----------------------------------------
       WHATSAPP
    ----------------------------------------- */

    const whatsappLink =
        createWhatsAppLink(
            appointment,
            car
        );


    localStorage.setItem(
        "autocare_last_whatsapp",
        whatsappLink
    );


    /* -----------------------------------------
       ОЧИСТКА
    ----------------------------------------- */

    event.target.reset();


    closeModal("bookingModal");

    renderAppointments();

    renderHistory();


    /* -----------------------------------------
       SUCCESS
    ----------------------------------------- */

    openModal("successModal");


    /*
     * Автоматически открываем WhatsApp.
     *
     * Браузер не позволяет сайту отправить
     * сообщение полностью самостоятельно.
     *
     * Откроется WhatsApp с уже подготовленным
     * красивым текстом.
     */

    setTimeout(
        function () {

            window.open(
                whatsappLink,
                "_blank"
            );

        },
        500
    );

}


/* =========================================================
   WHATSAPP
========================================================= */

function createWhatsAppLink(
    appointment,
    car
) {

    const message = `🚗 *НОВАЯ ЗАПИСЬ AUTOCARE*


👤 *Клиент:*
${currentUser.name}

📧 *Email:*
${currentUser.email}


🚘 *АВТОМОБИЛЬ*

Марка и модель: ${car.make} ${car.model}
📅 Год: ${car.year}
🎨 Цвет: ${car.color}
🔢 Госномер: ${car.plate}
🛣 Пробег: ${Number(car.mileage || 0).toLocaleString("ru-RU")} км


🔧 *УСЛУГА*

${appointment.service}


📆 *ЗАПИСЬ*

Дата: ${formatDate(appointment.date)}
⏰ Время: ${appointment.time}


📝 *Жалоба клиента:*

${appointment.complaint || "Не указана"}


📌 *Статус:*
Ожидает подтверждения


✨ AutoCare — забота о вашем автомобиле!`;


    return (
        `https://wa.me/${WHATSAPP_NUMBER}` +
        `?text=${encodeURIComponent(message)}`
    );

}


/* =========================================================
   МОИ ЗАПИСИ
========================================================= */

function renderAppointments() {

    const container =
        document.getElementById(
            "appointmentsContainer"
        );

    if (!container) {
        return;
    }


    if (!currentUser) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📋
                </div>

                <h3>
                    Войдите в аккаунт
                </h3>

                <p>
                    После входа здесь будут
                    отображаться ваши записи.
                </p>

                <button
                    class="btn btn-primary"
                    onclick="openModal('loginModal')"
                >
                    Войти
                </button>

            </div>

        `;

        return;
    }


    if (isAdmin()) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    👑
                </div>

                <h3>
                    Вы администратор
                </h3>

                <p>
                    Все записи клиентов находятся
                    в панели администратора.
                </p>

                <button
                    class="btn btn-primary"
                    onclick="
                        document
                            .getElementById('adminPanel')
                            ?.scrollIntoView({
                                behavior:'smooth'
                            });
                    "
                >
                    Открыть панель
                </button>

            </div>

        `;

        return;
    }


    const userAppointments =
        getUserAppointments();


    if (userAppointments.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📅
                </div>

                <h3>
                    Записей пока нет
                </h3>

                <p>
                    Запишитесь на обслуживание
                    вашего автомобиля.
                </p>

                <button
                    class="btn btn-primary"
                    onclick="openBooking()"
                >
                    Записаться
                </button>

            </div>

        `;

        return;
    }


    const sorted =
        [...userAppointments]
            .sort(
                (a, b) =>
                    new Date(
                        `${b.date}T${b.time}`
                    ) -
                    new Date(
                        `${a.date}T${a.time}`
                    )
            );


    container.innerHTML =
        sorted
            .map(
                appointment =>
                    createAppointmentCard(
                        appointment
                    )
            )
            .join("");

}


/* =========================================================
   КАРТОЧКА ЗАПИСИ
========================================================= */

function createAppointmentCard(
    appointment
) {

    const stage =
        getStageData(
            appointment
        );


    return `

        <article class="appointment-card">

            <div class="appointment-header">

                <div>

                    <h3>
                        🚗
                        ${escapeHTML(
                            appointment.carName
                        )}
                    </h3>

                    <span>
                        Госномер:
                        ${escapeHTML(
                            appointment.plate
                        )}
                    </span>

                </div>


                <span
                    class="
                        appointment-status
                        ${getStatusClass(
                            appointment.status
                        )}
                    "
                >
                    ${escapeHTML(
                        appointment.status
                    )}
                </span>

            </div>


            ${createProgressHTML(appointment)}


            <div class="appointment-info">

                <div>

                    <span>
                        Услуга
                    </span>

                    <strong>
                        ${escapeHTML(
                            appointment.service
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Дата
                    </span>

                    <strong>
                        ${formatDate(
                            appointment.date
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Время
                    </span>

                    <strong>
                        ${escapeHTML(
                            appointment.time
                        )}
                    </strong>

                </div>

            </div>


            <div class="appointment-complaint">

                <strong>
                    Жалоба клиента
                </strong>

                <p>
                    ${escapeHTML(
                        appointment.complaint ||
                        "Не указана"
                    )}
                </p>

            </div>


            <div class="appointment-actions">

                <span>
                    Этап:
                    ${escapeHTML(
                        stage.name
                    )}
                </span>


                ${
                    appointment.status ===
                    "Ожидает подтверждения"
                        ? `
                            <button
                                class="btn btn-outline"
                                onclick="cancelAppointment(${appointment.id})"
                            >
                                Отменить
                            </button>
                        `
                        : ""
                }

            </div>

        </article>

    `;
}


/* =========================================================
   ПРОГРЕСС АВТОМОБИЛЯ
========================================================= */

function createProgressHTML(
    appointment
) {

    const currentStage =
        Number(
            appointment.stage ?? 0
        );


    const stages = [

        "Заявка",

        "Подтверждена",

        "Принят",

        "В работе",

        "Готово"

    ];


    return `

        <div class="car-progress">

            <div class="progress-title">

                <span>
                    Состояние автомобиля
                </span>

                <strong>
                    ${escapeHTML(
                        getStageData(
                            appointment
                        ).name
                    )}
                </strong>

            </div>


            <div class="progress-line">

                ${stages
                    .map(
                        (
                            stage,
                            index
                        ) => `

                            <div
                                class="
                                    progress-step
                                    ${
                                        index <
                                        currentStage
                                            ? "completed"
                                            : ""
                                    }
                                    ${
                                        index ===
                                        currentStage
                                            ? "active"
                                            : ""
                                    }
                                "
                            >

                                <div class="progress-circle">

                                    ${
                                        index <
                                        currentStage
                                            ? "✓"
                                            : index + 1
                                    }

                                </div>

                                <span>
                                    ${stage}
                                </span>

                            </div>

                        `
                    )
                    .join("")}

            </div>

        </div>

    `;

}


/* =========================================================
   СТАДИИ
========================================================= */

function getStageData(
    appointment
) {

    const stage =
        Number(
            appointment.stage ?? 0
        );


    const stages = [

        {
            name:
                "Заявка отправлена",

            status:
                "Ожидает подтверждения"
        },

        {
            name:
                "Запись подтверждена",

            status:
                "Подтверждена"
        },

        {
            name:
                "Автомобиль принят",

            status:
                "Автомобиль принят"
        },

        {
            name:
                "Автомобиль в работе",

            status:
                "В работе"
        },

        {
            name:
                "Ремонт завершён",

            status:
                "Завершена"
        }

    ];


    if (
        appointment.status ===
        "Отменена"
    ) {

        return {

            name:
                "Запись отменена",

            status:
                "Отменена"

        };

    }


    return (
        stages[
            Math.max(
                0,
                Math.min(
                    stage,
                    stages.length - 1
                )
            )
        ]
    );

}


/* =========================================================
   CSS STATUS
========================================================= */

function getStatusClass(
    status
) {

    switch (status) {

        case "Ожидает подтверждения":
            return "status-pending";

        case "Подтверждена":
        case "Автомобиль принят":
            return "status-confirmed";

        case "В работе":
            return "status-progress";

        case "Завершена":
            return "status-completed";

        case "Отменена":
            return "status-cancelled";

        default:
            return "status-pending";

    }

}


/* =========================================================
   ОТМЕНА ЗАПИСИ КЛИЕНТОМ
========================================================= */

function cancelAppointment(
    appointmentId
) {

    if (!currentUser || isAdmin()) {
        return;
    }


    const appointment =
        appointments.find(
            item =>
                item.id === appointmentId
        );


    if (!appointment) {
        return;
    }


    if (
        appointment.ownerEmail !==
        currentUser.email
    ) {

        alert(
            "У вас нет доступа к этой записи."
        );

        return;
    }


    if (
        appointment.status !==
        "Ожидает подтверждения"
    ) {

        alert(
            "Эту запись уже нельзя отменить."
        );

        return;
    }


    const confirmed =
        confirm(
            "Отменить запись?"
        );


    if (!confirmed) {
        return;
    }


    appointment.status =
        "Отменена";

    appointment.stage =
        0;

    appointment.stageName =
        "Запись отменена";

    appointment.updatedAt =
        new Date().toISOString();


    saveAppointments();

    renderAppointments();

    renderHistory();

}


/* =========================================================
   ИСТОРИЯ
========================================================= */

function renderHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );

    if (!container) {
        return;
    }


    if (!currentUser) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📜
                </div>

                <h3>
                    История обслуживания
                </h3>

                <p>
                    Войдите в аккаунт,
                    чтобы увидеть историю.
                </p>

            </div>

        `;

        return;
    }


    if (isAdmin()) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    👑
                </div>

                <h3>
                    История клиентов
                </h3>

                <p>
                    Завершённые записи доступны
                    администратору в общей панели.
                </p>

            </div>

        `;

        return;
    }


    const history =
        getUserAppointments()
            .filter(
                appointment =>
                    appointment.status ===
                    "Завершена"
            )
            .sort(
                (a, b) =>
                    new Date(
                        `${b.date}T${b.time}`
                    ) -
                    new Date(
                        `${a.date}T${a.time}`
                    )
            );


    if (history.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📜
                </div>

                <h3>
                    История пока пуста
                </h3>

                <p>
                    Здесь появятся завершённые
                    обслуживания вашего автомобиля.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        history
            .map(
                appointment =>
                    createHistoryCard(
                        appointment
                    )
            )
            .join("");

}


function createHistoryCard(
    appointment
) {

    return `

        <article class="appointment-card">

            <div class="appointment-header">

                <div>

                    <h3>
                        🚗
                        ${escapeHTML(
                            appointment.carName
                        )}
                    </h3>

                    <span>
                        ${escapeHTML(
                            appointment.plate
                        )}
                    </span>

                </div>

                <span
                    class="
                        appointment-status
                        status-completed
                    "
                >
                    ✓ Завершена
                </span>

            </div>


            <div class="appointment-info">

                <div>

                    <span>
                        Услуга
                    </span>

                    <strong>
                        ${escapeHTML(
                            appointment.service
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Дата
                    </span>

                    <strong>
                        ${formatDate(
                            appointment.date
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Автомобиль
                    </span>

                    <strong>
                        ${escapeHTML(
                            appointment.carName
                        )}
                    </strong>

                </div>

            </div>


            <div class="appointment-complaint">

                <strong>
                    Статус обслуживания
                </strong>

                <p>
                    Работа по автомобилю
                    успешно завершена.
                </p>

            </div>

        </article>

    `;

}


/* =========================================================
   АДМИН-ПАНЕЛЬ
========================================================= */

function renderAdminPanel() {

    if (!isAdmin()) {
        return;
    }


    const adminPanel =
        document.getElementById(
            "adminPanel"
        );


    if (adminPanel) {
        adminPanel.style.display = "block";
    }


    renderAdminStats();

    renderAdminAppointments();

    renderAdminClients();

    renderAdminCars();

}


/* =========================================================
   СТАТИСТИКА АДМИНА
========================================================= */

function renderAdminStats() {

    const total =
        document.getElementById(
            "adminTotalAppointments"
        );

    const pending =
        document.getElementById(
            "adminPendingAppointments"
        );

    const working =
        document.getElementById(
            "adminWorkingAppointments"
        );

    const completed =
        document.getElementById(
            "adminCompletedAppointments"
        );


    if (total) {

        total.textContent =
            appointments.length;

    }


    if (pending) {

        pending.textContent =
            appointments.filter(
                appointment =>
                    appointment.status ===
                    "Ожидает подтверждения"
            ).length;

    }


    if (working) {

        working.textContent =
            appointments.filter(
                appointment =>
                    appointment.status ===
                        "В работе" ||
                    appointment.status ===
                        "Автомобиль принят"
            ).length;

    }


    if (completed) {

        completed.textContent =
            appointments.filter(
                appointment =>
                    appointment.status ===
                    "Завершена"
            ).length;

    }

}


/* =========================================================
   АДМИН — ЗАПИСИ
========================================================= */

function renderAdminAppointments() {

    const container =
        document.getElementById(
            "adminAppointmentsContainer"
        );

    if (!container) {
        return;
    }


    if (appointments.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📋
                </div>

                <h3>
                    Записей пока нет
                </h3>

                <p>
                    Новые заявки клиентов
                    появятся здесь.
                </p>

            </div>

        `;

        return;
    }


    const sorted =
        [...appointments]
            .sort(
                (a, b) =>
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
            );


    container.innerHTML =
        sorted
            .map(
                appointment =>
                    createAdminAppointment(
                        appointment
                    )
            )
            .join("");

}


/* =========================================================
   АДМИН — КАРТОЧКА ЗАПИСИ
========================================================= */

function createAdminAppointment(
    appointment
) {

    const nextAction =
        getAdminNextAction(
            appointment
        );


    return `

        <div class="admin-appointment">

            <div class="admin-appointment-top">

                <div class="admin-appointment-title">

                    <div class="admin-appointment-icon">
                        🚗
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(
                                appointment.carName
                            )}
                        </h3>

                        <span>
                            Клиент:
                            ${escapeHTML(
                                appointment.ownerName ||
                                appointment.ownerEmail
                            )}
                        </span>

                    </div>

                </div>


                <span
                    class="
                        appointment-status
                        ${getStatusClass(
                            appointment.status
                        )}
                    "
                >
                    ${escapeHTML(
                        appointment.status
                    )}
                </span>

            </div>


            <div class="admin-appointment-info">

                <div class="admin-info-item">

                    <span>
                        Госномер
                    </span>

                    <strong>
                        ${escapeHTML(
                            appointment.plate
                        )}
                    </strong>

                </div>


                <div class="admin-info-item">

                    <span>
                        Услуга
                    </span>

                    <strong>
                        ${escapeHTML(
                            appointment.service
                        )}
                    </strong>

                </div>


                <div class="admin-info-item">

                    <span>
                        Дата
                    </span>

                    <strong>
                        ${formatDate(
                            appointment.date
                        )}
                        •
                        ${escapeHTML(
                            appointment.time
                        )}
                    </strong>

                </div>


                <div class="admin-info-item">

                    <span>
                        Цвет
                    </span>

                    <strong>
                        ${escapeHTML(
                            appointment.color || "—"
                        )}
                    </strong>

                </div>


                <div class="admin-info-item">

                    <span>
                        Пробег
                    </span>

                    <strong>
                        ${Number(
                            appointment.mileage || 0
                        ).toLocaleString("ru-RU")}
                        км
                    </strong>

                </div>


                <div class="admin-info-item">

                    <span>
                        Этап
                    </span>

                    <strong>
                        ${escapeHTML(
                            getStageData(
                                appointment
                            ).name
                        )}
                    </strong>

                </div>

            </div>


            ${
                appointment.complaint
                    ? `
                        <div class="appointment-complaint">

                            <strong>
                                Жалоба клиента
                            </strong>

                            <p>
                                ${escapeHTML(
                                    appointment.complaint
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }


            <div class="admin-appointment-actions">

                <button
                    class="btn btn-outline"
                    onclick="
                        openAdminWorkModal(
                            ${appointment.id}
                        )
                    "
                >
                    👁 Подробнее
                </button>


                ${
                    nextAction
                        ? `
                            <button
                                class="btn btn-primary"
                                onclick="
                                    adminAdvanceAppointment(
                                        ${appointment.id}
                                    )
                                "
                            >
                                ${nextAction.icon}
                                ${nextAction.text}
                            </button>
                        `
                        : ""
                }


                ${
                    appointment.status !== "Завершена" &&
                    appointment.status !== "Отменена"
                        ? `
                            <button
                                class="btn btn-danger"
                                onclick="
                                    adminCancelAppointment(
                                        ${appointment.id}
                                    )
                                "
                            >
                                Отменить
                            </button>
                        `
                        : ""
                }

            </div>

        </div>

    `;

}


/* =========================================================
   СЛЕДУЮЩЕЕ ДЕЙСТВИЕ АДМИНА
========================================================= */

function getAdminNextAction(
    appointment
) {

    switch (
        appointment.status
    ) {

        case "Ожидает подтверждения":

            return {

                text:
                    "Подтвердить",

                icon:
                    "✓"

            };


        case "Подтверждена":

            return {

                text:
                    "Принять автомобиль",

                icon:
                    "🚗"

            };


        case "Автомобиль принят":

            return {

                text:
                    "Начать работу",

                icon:
                    "🔧"

            };


        case "В работе":

            return {

                text:
                    "Завершить",

                icon:
                    "✓"

            };


        default:

            return null;

    }

}


/* =========================================================
   АДМИН — ПРОДВИЖЕНИЕ ЗАПИСИ
========================================================= */

function adminAdvanceAppointment(
    appointmentId
) {

    if (!isAdmin()) {

        alert(
            "Доступ запрещён."
        );

        return;
    }


    const appointment =
        appointments.find(
            item =>
                item.id === appointmentId
        );


    if (!appointment) {

        alert(
            "Запись не найдена."
        );

        return;
    }


    switch (
        appointment.status
    ) {

        case "Ожидает подтверждения":

            appointment.status =
                "Подтверждена";

            appointment.stage =
                1;

            appointment.stageName =
                "Запись подтверждена";

            break;


        case "Подтверждена":

            appointment.status =
                "Автомобиль принят";

            appointment.stage =
                2;

            appointment.stageName =
                "Автомобиль принят";

            break;


        case "Автомобиль принят":

            appointment.status =
                "В работе";

            appointment.stage =
                3;

            appointment.stageName =
                "Автомобиль в работе";

            break;


        case "В работе":

            appointment.status =
                "Завершена";

            appointment.stage =
                4;

            appointment.stageName =
                "Ремонт завершён";

            break;


        default:

            return;

    }


    appointment.updatedAt =
        new Date().toISOString();


    saveAppointments();


    renderAdminPanel();

    renderAppointments();

    renderHistory();


    alert(
        `Статус изменён: ${appointment.status}`
    );

}


/* =========================================================
   АДМИН — ОТМЕНА
========================================================= */

function adminCancelAppointment(
    appointmentId
) {

    if (!isAdmin()) {
        return;
    }


    const appointment =
        appointments.find(
            item =>
                item.id === appointmentId
        );


    if (!appointment) {
        return;
    }


    const confirmed =
        confirm(
            `Отменить запись ${appointment.carName}?`
        );


    if (!confirmed) {
        return;
    }


    appointment.status =
        "Отменена";

    appointment.stageName =
        "Запись отменена";

    appointment.updatedAt =
        new Date().toISOString();


    saveAppointments();


    renderAdminPanel();

    renderAppointments();

    renderHistory();

}


/* =========================================================
   АДМИН — КЛИЕНТЫ
========================================================= */

function renderAdminClients() {

    const container =
        document.getElementById(
            "adminClientsContainer"
        );

    if (!container) {
        return;
    }


    if (users.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    👥
                </div>

                <h3>
                    Клиентов пока нет
                </h3>

            </div>

        `;

        return;
    }


    container.innerHTML =
        users
            .map(
                user => {

                    const userCars =
                        cars.filter(
                            car =>
                                car.ownerEmail ===
                                user.email
                        ).length;


                    const userAppointments =
                        appointments.filter(
                            appointment =>
                                appointment.ownerEmail ===
                                user.email
                        ).length;


                    return `

                        <div class="admin-client">

                            <div class="admin-client-info">

                                <div class="admin-client-avatar">
                                    ${escapeHTML(
                                        getInitials(
                                            user.name
                                        )
                                    )}
                                </div>

                                <div>

                                    <h3>
                                        ${escapeHTML(
                                            user.name
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            user.email
                                        )}
                                    </p>

                                </div>

                            </div>


                            <div
                                style="
                                    text-align:right;
                                "
                            >

                                <p>
                                    🚗 ${userCars}
                                    автомобилей
                                </p>

                                <p>
                                    📋 ${userAppointments}
                                    записей
                                </p>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   АДМИН — АВТОМОБИЛИ
========================================================= */

function renderAdminCars() {

    const container =
        document.getElementById(
            "adminCarsContainer"
        );

    if (!container) {
        return;
    }


    if (cars.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🚗
                </div>

                <h3>
                    Автомобилей пока нет
                </h3>

            </div>

        `;

        return;
    }


    container.innerHTML =
        cars
            .map(
                car => {

                    const owner =
                        users.find(
                            user =>
                                user.email ===
                                car.ownerEmail
                        );


                    return `

                        <div class="admin-car">

                            <div class="admin-car-left">

                                <div class="admin-car-icon">
                                    🚗
                                </div>

                                <div class="admin-car-info">

                                    <h3>
                                        ${escapeHTML(
                                            car.make
                                        )}
                                        ${escapeHTML(
                                            car.model
                                        )}
                                    </h3>

                                    <p>
                                        🔢
                                        ${escapeHTML(
                                            car.plate
                                        )}
                                        &nbsp; • &nbsp;
                                        🎨
                                        ${escapeHTML(
                                            car.color
                                        )}
                                    </p>

                                    <p>
                                        👤
                                        ${escapeHTML(
                                            owner?.name ||
                                            car.ownerName ||
                                            car.ownerEmail
                                        )}
                                    </p>

                                    <p>
                                        🛣
                                        ${Number(
                                            car.mileage || 0
                                        ).toLocaleString("ru-RU")}
                                        км
                                    </p>

                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   ПОДРОБНОСТИ ЗАПИСИ АДМИНА
========================================================= */

function openAdminWorkModal(
    appointmentId
) {

    if (!isAdmin()) {

        alert(
            "Доступ запрещён."
        );

        return;
    }


    const appointment =
        appointments.find(
            item =>
                item.id === appointmentId
        );


    if (!appointment) {
        return;
    }


    const container =
        document.getElementById(
            "adminWorkContent"
        );


    if (!container) {
        return;
    }


    const car =
        cars.find(
            item =>
                item.id ===
                appointment.carId
        );


    container.innerHTML = `

        <div class="admin-detail-grid">

            <div>

                <span>
                    Клиент
                </span>

                <strong>
                    ${escapeHTML(
                        appointment.ownerName ||
                        "—"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHTML(
                        appointment.ownerEmail
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Автомобиль
                </span>

                <strong>
                    ${escapeHTML(
                        appointment.carName
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Госномер
                </span>

                <strong>
                    ${escapeHTML(
                        appointment.plate
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Цвет
                </span>

                <strong>
                    ${escapeHTML(
                        appointment.color ||
                        car?.color ||
                        "—"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Пробег
                </span>

                <strong>
                    ${Number(
                        appointment.mileage ||
                        car?.mileage ||
                        0
                    ).toLocaleString("ru-RU")}
                    км
                </strong>

            </div>


            <div>

                <span>
                    Услуга
                </span>

                <strong>
                    ${escapeHTML(
                        appointment.service
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Дата
                </span>

                <strong>
                    ${formatDate(
                        appointment.date
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Время
                </span>

                <strong>
                    ${escapeHTML(
                        appointment.time
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Статус
                </span>

                <strong>
                    ${escapeHTML(
                        appointment.status
                    )}
                </strong>

            </div>

        </div>


        <div class="appointment-complaint">

            <strong>
                Жалоба клиента
            </strong>

            <p>
                ${escapeHTML(
                    appointment.complaint ||
                    "Не указана"
                )}
            </p>

        </div>


        <button
            class="btn btn-primary btn-full"
            onclick="
                adminAdvanceAppointment(
                    ${appointment.id}
                );
                closeModal('adminWorkModal');
            "
            ${
                !getAdminNextAction(
                    appointment
                )
                    ? "disabled"
                    : ""
            }
        >

            ${
                getAdminNextAction(
                    appointment
                )
                    ? `
                        ${
                            getAdminNextAction(
                                appointment
                            ).icon
                        }
                        ${
                            getAdminNextAction(
                                appointment
                            ).text
                        }
                    `
                    : "Работа завершена"
            }

        </button>

    `;


    openModal(
        "adminWorkModal"
    );

}


/* =========================================================
   МОДАЛЬНЫЕ ОКНА
========================================================= */

function openModal(
    modalId
) {

    const modal =
        document.getElementById(
            modalId
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(
    modalId
) {

    const modal =
        document.getElementById(
            modalId
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    if (
        !document.querySelector(
            ".modal.active"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


function closeSuccessModal() {

    closeModal(
        "successModal"
    );

}


/* =========================================================
   ЗАКРЫТИЕ ПО КЛИКУ ВНЕ ОКНА
========================================================= */

function setupModals() {

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target.classList.contains(
                    "modal"
                )
            ) {

                event.target.classList.remove(
                    "active"
                );

                if (
                    !document.querySelector(
                        ".modal.active"
                    )
                ) {

                    document.body.classList.remove(
                        "modal-open"
                    );

                }

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal.active"
                    )
                    .forEach(
                        modal =>
                            modal.classList.remove(
                                "active"
                            )
                    );


                document.body.classList.remove(
                    "modal-open"
                );

            }

        }
    );

}


/* =========================================================
   МОБИЛЬНОЕ МЕНЮ
========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const mobileNav =
        document.getElementById(
            "mobileNav"
        );


    if (!button || !mobileNav) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            mobileNav.classList.toggle(
                "active"
            );

        }
    );


    mobileNav
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        mobileNav.classList.remove(
                            "active"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   НАВИГАЦИЯ
========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(
            '.nav a, .mobile-nav a, .footer-nav a'
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        const href =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            !href ||
                            !href.startsWith("#")
                        ) {
                            return;
                        }


                        const target =
                            document.querySelector(
                                href
                            );


                        if (target) {

                            setTimeout(
                                function () {

                                    target.scrollIntoView({
                                        behavior:
                                            "smooth"
                                    });

                                },
                                10
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   ДАТА — МИНИМАЛЬНО СЕГОДНЯ
========================================================= */

function setMinimumDate() {

    const dateInput =
        document.getElementById(
            "bookingDate"
        );


    if (!dateInput) {
        return;
    }


    const now =
        new Date();


    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    const today =
        `${year}-${month}-${day}`;


    dateInput.min =
        today;


    if (
        !dateInput.value
    ) {

        dateInput.value =
            today;

    }

}


/* =========================================================
   КЛАВИША ENTER / ESC
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            const mobileNav =
                document.getElementById(
                    "mobileNav"
                );


            if (mobileNav) {

                mobileNav.classList.remove(
                    "active"
                );

            }

        }

    }
);


/* =========================================================
   ОБНОВЛЕНИЕ ПО ВОЗВРАЩЕНИЮ НА СТРАНИЦУ
========================================================= */

window.addEventListener(
    "storage",
    function () {

        users =
            JSON.parse(
                localStorage.getItem(
                    "autocare_users"
                )
            ) || [];


        cars =
            JSON.parse(
                localStorage.getItem(
                    "autocare_cars"
                )
            ) || [];


        appointments =
            JSON.parse(
                localStorage.getItem(
                    "autocare_appointments"
                )
            ) || [];


        currentUser =
            JSON.parse(
                localStorage.getItem(
                    "autocare_current_user"
                )
            ) || null;


        updateUI();

    }
);


/* =========================================================
   ГЛОБАЛЬНЫЕ ФУНКЦИИ
========================================================= */

window.openModal =
    openModal;

window.closeModal =
    closeModal;

window.closeSuccessModal =
    closeSuccessModal;

window.openBooking =
    openBooking;

window.bookCar =
    bookCar;

window.deleteCar =
    deleteCar;

window.cancelAppointment =
    cancelAppointment;

window.logout =
    logout;

window.renderAdminPanel =
    renderAdminPanel;

window.openAdminWorkModal =
    openAdminWorkModal;

window.adminAdvanceAppointment =
    adminAdvanceAppointment;

window.adminCancelAppointment =
    adminCancelAppointment;


/* =========================================================
   ГОТОВО
========================================================= */

console.log(
    "🚗 AutoCare загружен."
);

console.log(
    "👑 Admin:",
    ADMIN_EMAIL
);