async function handleSignup() {
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Signup data:', { email, username, password });

    if (!email || !username || !password) {
        console.log('Validation failed: Missing fields');
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/auth/signup', {
            email,
            username,
            password
        });
        console.log('Signup response:', response.data);
        alert(response.data.message);
        window.location.href = 'index.html';
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'An error occurred during signup';
        console.error('Signup error:', errorMessage);
        alert(errorMessage);
    }
}

async function handleSignin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Signin data:', { username, password });

    if (!username || !password) {
        console.log('Validation failed: Missing fields');
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/auth/signin', {
            username,
            password
        });
        console.log('Signin response:', response.data);
        alert(response.data.message);
        if (response.data.username) {
            localStorage.setItem('username', response.data.username);
        }
        window.location.href = 'index.html';
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'An error occurred during signin';
        console.error('Signin error:', errorMessage);
        alert(errorMessage);
    }
}

// Các biến DOM có thể sử dụng const thay vì let
const searchBtn = document.querySelector('#search-btn');
const searchBar = document.querySelector('.search-bar-container');
const menu = document.querySelector('#menu-bar');
const navbar = document.querySelector('.navbar');
const videoBtn = document.querySelectorAll('.vid-btn');

window.onscroll = () => {
    searchBtn.classList.remove('fa-times');
    searchBar.classList.remove('active');
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
};

menu.addEventListener('click', () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
});

searchBtn.addEventListener('click', () => {
    searchBtn.classList.toggle('fa-times');
    searchBar.classList.toggle('active');
});

videoBtn.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.controls .active').classList.remove('active');
        btn.classList.add('active');
        let src = btn.getAttribute('data-src');
        document.querySelector('#video-slider').src = src;
    });
});

// Dùng const thay vì var
const swiperReview = new Swiper(".review-slider", {
    spaceBetween: 20,
    loop: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    breakpoints: {
        640: {
            slidesPerView: 1,
        },
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});

const swiperBrand = new Swiper(".brand-slider", {
    spaceBetween: 20,
    loop: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    breakpoints: {
        450: {
            slidesPerView: 2,
        },
        768: {
            slidesPerView: 3,
        },
        991: {
            slidesPerView: 4,
        },
        1200: {
            slidesPerView: 5,
        },
    },
});
