<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus 360° ERP & Governance Portal</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts: Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            50: '#eef2ff',
                            100: '#e0e7ff',
                            500: '#6366f1',
                            600: '#4f46e5',
                            700: '#4338ca',
                            800: '#3730a3',
                            900: '#312e81',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">

    <!-- Toast Notification Overlay -->
    <div id="toast-container" class="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>

    <!-- MAIN APP CONTAINER -->
    <div id="app" class="min-h-screen flex flex-col relative">

        <!-- Top Header Navigation -->
        <header class="bg-indigo-950 text-white sticky top-0 z-30 shadow-md border-b border-indigo-900/50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                <div class="flex items-center space-x-3">
                    <!-- Hamburger button: Disabled & locked until student is fully logged in & verified -->
                    <button id="hamburger-btn" 
                            onclick="toggleDrawer(true)" 
                            disabled 
                            title="Complete Login & Verification first to unlock navigation"
                            class="p-2 rounded-lg bg-indigo-900/40 text-slate-500 cursor-not-allowed opacity-50 transition-all focus:outline-none">
                        <i class="fa-solid fa-bars text-xl"></i>
                    </button>
                    
                    <div class="flex items-center space-x-2.5 cursor-pointer" onclick="navigateTo('home')">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-300 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30">
                            360
                        </div>
                        <div>
                            <h1 class="font-bold text-lg leading-tight tracking-wide">Campus 360°</h1>
                            <p class="text-[11px] text-indigo-300 font-medium">ERP & Operational Portal</p>
                        </div>
                    </div>
                </div>

                <!-- User & Role Status Bar -->
                <div class="flex items-center space-x-3">
                    <!-- Student Identity Pill -->
                    <div id="user-pill" class="hidden sm:flex items-center space-x-2 bg-indigo-900/80 px-3 py-1.5 rounded-full border border-indigo-700/60 text-xs">
                        <i class="fa-solid fa-circle-user text-indigo-300 text-sm"></i>
                        <span id="nav-student-name" class="font-medium text-white">Guest Student</span>
                    </div>

                    <!-- Role Switcher (Student / Admin) -->
                    <button onclick="toggleRole()" id="role-toggle-btn" class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm">
                        <i class="fa-solid fa-rotate"></i>
                        <span id="current-role-label">Mode: Student</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Left Navigation Drawer -->
        <div id="drawer-overlay" onclick="toggleDrawer(false)" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 hidden transition-opacity duration-300"></div>
        <aside id="drawer" class="fixed top-0 left-0 h-full w-80 bg-slate-900 text-white z-50 transform -translate-x-full transition-transform duration-300 flex flex-col justify-between shadow-2xl">
            <div>
                <div class="p-5 border-b border-slate-800 flex justify-between items-center bg-indigo-950">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-sm" id="drawer-student-name">Verified Student</p>
                            <p class="text-xs text-slate-400" id="drawer-student-id">Reg: -</p>
                        </div>
                    </div>
                    <button onclick="toggleDrawer(false)" class="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <!-- Drawer Navigation Links -->
                <nav class="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                    <button onclick="drawerNavigate('home')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-house text-indigo-400 w-5"></i> Home Dashboard
                    </button>
                    <button onclick="drawerNavigate('campus')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-building-flag text-emerald-400 w-5"></i> Campus Issues
                    </button>
                    <button onclick="drawerNavigate('academic')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-book-open text-blue-400 w-5"></i> Academic Complaints
                    </button>
                    <button onclick="drawerNavigate('hostel')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-plug text-amber-400 w-5"></i> Hostel Maintenance
                    </button>
                    <button onclick="drawerNavigate('mess')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-utensils text-purple-400 w-5"></i> Mess & Food Portal
                    </button>
                    <button onclick="drawerNavigate('security')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-shield-cat text-rose-400 w-5"></i> Security & CCTV Video
                    </button>
                    <button onclick="drawerNavigate('tickets')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-ticket text-indigo-400 w-5"></i> Ticket Resolution Tracker
                    </button>
                    <button onclick="drawerNavigate('gatepass')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-passport text-teal-400 w-5"></i> Dynamic Out-Pass
                    </button>
                    <button onclick="drawerNavigate('nodues')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-file-circle-check text-cyan-400 w-5"></i> No-Dues Clearance
                    </button>
                    <button onclick="drawerNavigate('profile')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-id-card text-indigo-400 w-5"></i> My Profile
                    </button>
                    <button onclick="drawerNavigate('settings')" class="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex items-center gap-3 font-medium text-sm text-slate-200 transition">
                        <i class="fa-solid fa-gear text-slate-400 w-5"></i> Settings
                    </button>
                </nav>
            </div>

            <div class="p-4 border-t border-slate-800">
                <button onclick="logoutPrimary()" class="w-full py-2.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition">
                    <i class="fa-solid fa-right-from-bracket"></i> Switch Account / Logout
                </button>
            </div>
        </aside>

        <!-- MAIN CONTENT AREA -->
        <main class="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

            <!-- ================= VIEW 1: PRIMARY LOGIN SCREEN ================= -->
            <section id="view-login" class="min-h-[75vh] flex items-center justify-center">
                <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div class="p-8 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white text-center">
                        <div class="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-3 backdrop-blur-md border border-white/20 shadow-inner">
                            <i class="fa-solid fa-university text-indigo-300"></i>
                        </div>
                        <h2 class="text-2xl font-black tracking-tight">Campus 360° Portal</h2>
                        <p class="text-xs text-indigo-200 mt-1">Select your preferred login channel to begin</p>
                    </div>

                    <div class="p-6 space-y-5">
                        <!-- Login Tab Switcher -->
                        <div class="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                            <button id="tab-btn-gmail" onclick="switchLoginTab('gmail')" class="flex-1 py-2.5 rounded-lg bg-white shadow-sm text-indigo-900 text-center font-bold transition">
                                <i class="fa-brands fa-google mr-1 text-red-500"></i> Google / Gmail
                            </button>
                            <button id="tab-btn-phone" onclick="switchLoginTab('phone')" class="flex-1 py-2.5 rounded-lg text-slate-600 text-center font-bold transition hover:text-slate-900">
                                <i class="fa-solid fa-mobile-screen-button mr-1 text-indigo-600"></i> Phone OTP
                            </button>
                        </div>

                        <!-- Gmail Login Panel -->
                        <div id="panel-login-gmail" class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Campus Gmail Address</label>
                                <input type="email" id="login-gmail-input" placeholder="student@university.edu.in" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition">
                            </div>
                            <button onclick="handlePrimaryLogin('gmail')" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2">
                                <i class="fa-brands fa-google"></i> Sign In with Google
                            </button>
                        </div>

                        <!-- Phone Login Panel -->
                        <div id="panel-login-phone" class="space-y-4 hidden">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Registered Mobile Number</label>
                                <div class="flex gap-2">
                                    <span class="px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-600 font-bold">+91</span>
                                    <input type="tel" id="login-phone-input" placeholder="9876543210" maxlength="10" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition">
                                </div>
                            </div>
                            <div id="otp-container" class="hidden space-y-1">
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Enter OTP (Simulated: 123456)</label>
                                <input type="text" id="login-otp-input" placeholder="123456" maxlength="6" class="w-full text-center tracking-widest font-black text-lg px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            </div>
                            <button id="phone-action-btn" onclick="handlePhoneOTPFlow()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2">
                                <i class="fa-solid fa-paper-plane"></i> Send OTP
                            </button>
                        </div>

                        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
                            <i class="fa-solid fa-lock text-amber-600 text-sm mt-0.5"></i>
                            <span><strong>Security Notice:</strong> The navigation menu is locked until primary authentication and mandatory student details are verified.</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ================= MODAL: MANDATORY STUDENT REGISTRATION ================= -->
            <div id="modal-student-verify" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-indigo-100">
                    <div class="text-center mb-6">
                        <div class="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
                            <i class="fa-solid fa-id-card"></i>
                        </div>
                        <h3 class="text-xl font-extrabold text-slate-900">Mandatory Student Verification</h3>
                        <p class="text-xs text-slate-500 mt-1">Provide your official institutional details to unlock all portal modules and navigation.</p>
                    </div>

                    <form id="student-reg-form" onsubmit="submitStudentRegistration(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Student Registration ID <span class="text-red-500">*</span></label>
                            <input type="text" id="reg-id-input" required placeholder="e.g. REG2026-9042" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-mono">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Full Student Name <span class="text-red-500">*</span></label>
                            <input type="text" id="reg-name-input" required placeholder="e.g. Rahul Sharma" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Roll Number <span class="text-red-500">*</span></label>
                            <input type="text" id="reg-roll-input" required placeholder="e.g. 210543201" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono">
                        </div>

                        <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 mt-2 flex items-center justify-center gap-2">
                            <span>Verify & Unlock Portal</span> <i class="fa-solid fa-arrow-right text-xs"></i>
                        </button>
                    </form>
                </div>
            </div>

            <!-- ================= MAIN PORTAL CONTENT CONTAINER ================= -->
            <div id="main-portal-content" class="hidden space-y-6">

                <!-- DASHBOARD HOME VIEW -->
                <div id="view-home" class="space-y-6">
                    <!-- Welcome Hero Banner -->
                    <div class="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-800/40">
                        <div class="relative z-10 max-w-2xl">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-medium mb-3 backdrop-blur-sm">
                                <i class="fa-solid fa-shield-halved text-emerald-400"></i> Session Verified & Navigation Unlocked
                            </span>
                            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight" id="dashboard-welcome-heading">Welcome, Student</h2>
                            <p class="text-xs sm:text-sm text-indigo-200 mt-2 leading-relaxed">Report campus infrastructure issues, academic complaints, hostel repairs, mess feedback, or request CCTV reviews with SLA tracking.</p>
                        </div>
                    </div>

                    <!-- 5 Department Quick Access Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <!-- Module 1: Campus (Green) -->
                        <div onclick="navigateTo('campus')" class="bg-white p-5 rounded-2xl border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between group">
                            <div>
                                <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-building-flag"></i>
                                </div>
                                <h3 class="font-bold text-slate-900 text-base">Campus</h3>
                                <p class="text-xs text-slate-500 mt-1">Cleanliness, grounds, lights & surroundings with 24hr SLA.</p>
                            </div>
                            <span class="text-xs text-emerald-600 font-bold mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Report Issue <i class="fa-solid fa-chevron-right text-[10px]"></i>
                            </span>
                        </div>

                        <!-- Module 2: Academic (Blue) -->
                        <div onclick="navigateTo('academic')" class="bg-white p-5 rounded-2xl border border-blue-200 hover:border-blue-400 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between group">
                            <div>
                                <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-book-open"></i>
                                </div>
                                <h3 class="font-bold text-slate-900 text-base">Academic</h3>
                                <p class="text-xs text-slate-500 mt-1">Server errors, attendance, exam, marks & timetable issues.</p>
                            </div>
                            <span class="text-xs text-blue-600 font-bold mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Log Academic Issue <i class="fa-solid fa-chevron-right text-[10px]"></i>
                            </span>
                        </div>

                        <!-- Module 3: Hostel Maintenance (Orange) -->
                        <div onclick="navigateTo('hostel')" class="bg-white p-5 rounded-2xl border border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between group">
                            <div>
                                <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-plug"></i>
                                </div>
                                <h3 class="font-bold text-slate-900 text-base">Hostel Repair</h3>
                                <p class="text-xs text-slate-500 mt-1">Wi-Fi, electricity, plumbing, tuta gate, fan & coolers.</p>
                            </div>
                            <span class="text-xs text-amber-600 font-bold mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Request Repair <i class="fa-solid fa-chevron-right text-[10px]"></i>
                            </span>
                        </div>

                        <!-- Module 4: Mess (Purple) -->
                        <div onclick="navigateTo('mess')" class="bg-white p-5 rounded-2xl border border-purple-200 hover:border-purple-400 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between group">
                            <div>
                                <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-utensils"></i>
                                </div>
                                <h3 class="font-bold text-slate-900 text-base">Mess Portal</h3>
                                <p class="text-xs text-slate-500 mt-1">Daily ratings, 30-day menu polls & hygiene complaints.</p>
                            </div>
                            <span class="text-xs text-purple-600 font-bold mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Open Mess Portal <i class="fa-solid fa-chevron-right text-[10px]"></i>
                            </span>
                        </div>

                        <!-- Module 5: Security (Red) -->
                        <div onclick="navigateTo('security')" class="bg-white p-5 rounded-2xl border border-rose-200 hover:border-rose-400 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between group">
                            <div>
                                <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-shield-cat"></i>
                                </div>
                                <h3 class="font-bold text-slate-900 text-base">Security</h3>
                                <p class="text-xs text-slate-500 mt-1">Theft reporting & 24hr CCTV video request stream.</p>
                            </div>
                            <span class="text-xs text-rose-600 font-bold mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                CCTV & Safety <i class="fa-solid fa-chevron-right text-[10px]"></i>
                            </span>
                        </div>
                    </div>

                    <!-- Recent Tickets Quick Overview Table -->
                    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                <i class="fa-solid fa-clock-rotate-left text-indigo-600"></i> My Active Complaints
                            </h3>
                            <button onclick="navigateTo('tickets')" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold">View Resolution Tracker &rarr;</button>
                        </div>
                        <div id="recent-tickets-list" class="divide-y divide-slate-100">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>

                <!-- SECTION 1: CAMPUS -->
                <div id="view-campus" class="hidden space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-extrabold text-slate-900">Campus Issue Reporting</h2>
                            <p class="text-xs text-slate-500">Report physical infrastructure, cleanliness, or street light issues with a 24-hour SLA.</p>
                        </div>
                        <button onclick="navigateTo('home')" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition">
                            <i class="fa-solid fa-arrow-left mr-1"></i> Back
                        </button>
                    </div>

                    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-5">
                        <form onsubmit="handleTicketSubmit(event, 'Campus')" class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Issue Category <span class="text-red-500">*</span></label>
                                <select id="campus-category" required class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                                    <option value="Cleanliness & Sanitation">Cleanliness & Sanitation</option>
                                    <option value="Street Lights / Lighting">Street Lights / Lighting</option>
                                    <option value="Room Issue">Room Issue</option>
                                    <option value="Campus Surrounding">Campus Surrounding</option>
                                    <option value="Other Campus Area">Other Campus Area</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Location / Building Block <span class="text-red-500">*</span></label>
                                <input type="text" id="campus-location" required placeholder="e.g. Science Block Ground Floor Near Lab 3" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Attach Photo Evidence</label>
                                <input type="file" id="campus-photo-file" accept="image/*" onchange="previewImage(event, 'campus-photo-preview')" class="w-full text-xs text-slate-500 border border-slate-300 rounded-xl p-2 bg-slate-50">
                                <div id="campus-photo-preview" class="mt-2 hidden">
                                    <img src="" alt="Preview" class="h-32 rounded-xl object-cover border border-slate-200 shadow-sm">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Description <span class="text-red-500">*</span></label>
                                <textarea id="campus-desc" required rows="3" placeholder="Describe the issue in detail..." class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"></textarea>
                            </div>
                            <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition">
                                <i class="fa-solid fa-paper-plane mr-1"></i> Submit Complaint (24hr SLA Clock Starts)
                            </button>
                        </form>
                    </div>
                </div>

                <!-- SECTION 2: ACADEMIC -->
                <div id="view-academic" class="hidden space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-extrabold text-slate-900">Academic Issue Desk</h2>
                            <p class="text-xs text-slate-500">Log concerns regarding server/portal glitches, attendance, results, or timetable conflicts.</p>
                        </div>
                        <button onclick="navigateTo('home')" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition">
                            <i class="fa-solid fa-arrow-left mr-1"></i> Back
                        </button>
                    </div>

                    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
                        <form onsubmit="handleTicketSubmit(event, 'Academic')" class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Select Issue Category <span class="text-red-500">*</span></label>
                                <select id="academic-category" required class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                                    <option value="Server / Portal Problem">Server / Portal Problem</option>
                                    <option value="Attendance Discrepancy">Attendance Discrepancy</option>
                                    <option value="Examination Schedule">Examination Schedule</option>
                                    <option value="Result / Marks Correction">Result / Marks Correction</option>
                                    <option value="Timetable Clash">Timetable Clash</option>
                                    <option value="Course / Subject Allocation">Course / Subject Allocation</option>
                                    <option value="Faculty-related Academic Issue">Faculty-related Academic Issue</option>
                                    <option value="Assignment / Submission Problem">Assignment / Submission Problem</option>
                                    <option value="Other Academic Concern">Other Academic Concern</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Detailed Description <span class="text-red-500">*</span></label>
                                <textarea id="academic-desc" required rows="4" placeholder="Provide subject code, exam details, or portal server error description..." class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"></textarea>
                            </div>
                            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30 transition">
                                <i class="fa-solid fa-paper-plane mr-1"></i> Submit Academic Complaint
                            </button>
                        </form>
                    </div>
                </div>

                <!-- SECTION 3: HOSTEL MAINTENANCE -->
                <div id="view-hostel" class="hidden space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-extrabold text-slate-900">Hostel Maintenance & Repair</h2>
                            <p class="text-xs text-slate-500">Submit repair requests for electrical, plumbing, water overflow, or damaged doors/gates.</p>
                        </div>
                        <button onclick="navigateTo('home')" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition">
                            <i class="fa-solid fa-arrow-left mr-1"></i> Back
                        </button>
                    </div>

                    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
                        <form onsubmit="handleTicketSubmit(event, 'Hostel')" class="space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">Hostel Block & Room No. <span class="text-red-500">*</span></label>
                                    <input type="text" id="hostel-room" required placeholder="e.g. Block A - Room 204" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">Issue Category <span class="text-red-500">*</span></label>
                                    <select id="hostel-category" required class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                                        <option value="Electricity">Electricity</option>
                                        <option value="Wi-Fi / Internet">Wi-Fi / Internet</option>
                                        <option value="Water Cooler">Water Cooler</option>
                                        <option value="Pipeline / Water Supply">Pipeline / Water Supply</option>
                                        <option value="Damaged Furniture / Property">Damaged Furniture / Property</option>
                                        <option value="Gates / Doors (Tuta Gates)">Gates / Doors (Tuta Gates)</option>
                                        <option value="Cleanliness">Cleanliness</option>
                                        <option value="Water Overflow / Leakage">Water Overflow / Leakage</option>
                                        <option value="Bathroom / Washroom">Bathroom / Washroom</option>
                                        <option value="Fan / Light">Fan / Light</option>
                                        <option value="Other Hostel Issue">Other Hostel Issue</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Description <span class="text-red-500">*</span></label>
                                <textarea id="hostel-desc" required rows="3" placeholder="Describe the fault or damaged item..." class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"></textarea>
                            </div>
                            <button type="submit" class="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-600/30 transition">
                                <i class="fa-solid fa-wrench mr-1"></i> Request Maintenance Staff
                            </button>
                        </form>
                    </div>
                </div>

                <!-- SECTION 4: MESS PORTAL -->
                <div id="view-mess" class="hidden space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-extrabold text-slate-900">Mess & Food Governance</h2>
                            <p class="text-xs text-slate-500">Rate daily meals, vote on 30-day menu proposals, or report hygiene issues.</p>
                        </div>
                        <button onclick="navigateTo('home')" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition">
                            <i class="fa-solid fa-arrow-left mr-1"></i> Back
                        </button>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Daily Meal Rating & Hygiene Complaint -->
                        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <i class="fa-solid fa-star text-amber-500"></i> Daily Meal Rating & Feedback
                            </h3>
                            
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-2">Today's Meal Quality (1 to 5 Stars)</label>
                                <div class="flex items-center gap-3 text-3xl text-slate-300 cursor-pointer" id="mess-star-rating">
                                    <i class="fa-solid fa-star hover:text-amber-400 transition-colors" onclick="setMessRating(1)"></i>
                                    <i class="fa-solid fa-star hover:text-amber-400 transition-colors" onclick="setMessRating(2)"></i>
                                    <i class="fa-solid fa-star hover:text-amber-400 transition-colors" onclick="setMessRating(3)"></i>
                                    <i class="fa-solid fa-star hover:text-amber-400 transition-colors" onclick="setMessRating(4)"></i>
                                    <i class="fa-solid fa-star hover:text-amber-400 transition-colors" onclick="setMessRating(5)"></i>
                                </div>
                            </div>

                            <form onsubmit="handleTicketSubmit(event, 'Mess')" class="space-y-4 pt-3 border-t border-slate-100">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">Mess Complaint / Hygiene Feedback</label>
                                    <textarea id="mess-desc" required rows="3" placeholder="Report unhygienic conditions, insect findings, taste, or water dispenser issues..." class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"></textarea>
                                </div>
                                <button type="submit" class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm shadow-md transition">
                                    Submit Mess Feedback / Complaint
                                </button>
                            </form>
                        </div>

                        <!-- 30-Day Menu Change Voting Poll -->
                        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <i class="fa-solid fa-check-to-slot text-purple-600"></i> 30-Day Menu Voting Poll
                            </h3>
                            <p class="text-xs text-slate-500">Vote for next month's proposed meal schedule:</p>

                            <div class="space-y-3 pt-1" id="mess-poll-container">
                                <!-- Dynamic Poll Options -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION 5: SECURITY & CCTV -->
                <div id="view-security" class="hidden space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-extrabold text-slate-900">Security & CCTV Video Pipeline</h2>
                            <p class="text-xs text-slate-500">Report theft or lost items and request official CCTV video playback within 24 hours.</p>
                        </div>
                        <button onclick="navigateTo('home')" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition">
                            <i class="fa-solid fa-arrow-left mr-1"></i> Back
                        </button>
                    </div>

                    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
                        <form onsubmit="handleTicketSubmit(event, 'Security')" class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Incident Type <span class="text-red-500">*</span></label>
                                <select id="security-type" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                                    <option value="Theft / Lost Property">Theft / Lost Property</option>
                                    <option value="CCTV Video Footage Request">CCTV Video Footage Request</option>
                                    <option value="Unidentified Intruder">Unidentified Intruder</option>
                                    <option value="Safety Hazard">Safety Hazard</option>
                                </select>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">Incident Date & Time <span class="text-red-500">*</span></label>
                                    <input type="datetime-local" id="security-time" required class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">Specific Location <span class="text-red-500">*</span></label>
                                    <input type="text" id="security-location" required placeholder="e.g. Block C Parking / Library 2nd Floor" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Incident Details & Stolen Items <span class="text-red-500">*</span></label>
                                <textarea id="security-desc" required rows="3" placeholder="Provide details of stolen items, suspicious activity, and why CCTV review is required..." class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"></textarea>
                            </div>
                            <button type="submit" class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-600/30 transition">
                                <i class="fa-solid fa-video mr-1"></i> Submit Incident & Request CCTV Stream
                            </button>
                        </form>
                    </div>
                </div>

                <!-- ALL TICKETS & RESOLUTION TRACKER VIEW -->
                <div id="view-tickets" class="hidden space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-extrabold text-slate-900">Ticket Resolution Tracker</h2>
                            <p class="text-xs text-slate-500">Track complaints, SLA status, and stream CCTV video clips once resolved.</p>
                        </div>
                        <button onclick="navigateTo('home')" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition">
                            <i class="fa-solid fa-arrow-left mr-1"></i> Back
                        </button>
                    </div>

                    <div id="all-tickets-container" class="space-y-4">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <!-- DYNAMIC GATE PASS VIEW -->
                <div id="view-gatepass" class="hidden space-y-6">
                    <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md max-w-md mx-auto text-center space-y-4">
                        <span class="px-3.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">Dynamic Out-Pass</span>
                        <h3 class="text-2xl font-black text-slate-900" id="gp-name">Rahul Sharma</h3>
                        <p class="text-xs font-mono text-slate-500" id="gp-id">Reg ID: REG2026-9042</p>
                        
                        <!-- Simulated QR Code Container -->
                        <div class="p-5 bg-slate-50 rounded-2xl inline-block border border-slate-200 shadow-inner">
                            <i class="fa-solid fa-qrcode text-9xl text-slate-800"></i>
                        </div>
                        
                        <div class="text-xs text-slate-500 font-mono" id="gp-timestamp">Pass Generated: Just Now</div>
                        <div class="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-medium">
                            <i class="fa-solid fa-shield-halved text-indigo-600 mr-1"></i> Valid for Campus Exit & Re-entry today. Present code at Main Gate.
                        </div>
                    </div>
                </div>

                <!-- NO DUES CLEARANCE VIEW -->
                <div id="view-nodues" class="hidden space-y-6">
                    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-4">
                        <h3 class="font-extrabold text-slate-900 text-lg">Paperless No-Dues Clearance Pipeline</h3>
                        <p class="text-xs text-slate-500">Automated multi-departmental clearance verification for final semester sign-off.</p>
                        
                        <div class="space-y-3 pt-2">
                            <div class="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div class="flex items-center gap-3">
                                    <i class="fa-solid fa-book text-emerald-600"></i>
                                    <span class="text-sm font-bold text-slate-800">Central Library</span>
                                </div>
                                <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full"><i class="fa-solid fa-check-circle mr-1"></i> CLEARED</span>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div class="flex items-center gap-3">
                                    <i class="fa-solid fa-utensils text-emerald-600"></i>
                                    <span class="text-sm font-bold text-slate-800">Hostel Warden & Mess Accounts</span>
                                </div>
                                <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full"><i class="fa-solid fa-check-circle mr-1"></i> CLEARED</span>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div class="flex items-center gap-3">
                                    <i class="fa-solid fa-file-invoice-dollar text-emerald-600"></i>
                                    <span class="text-sm font-bold text-slate-800">Academic Tuition Fee Cell</span>
                                </div>
                                <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full"><i class="fa-solid fa-check-circle mr-1"></i> CLEARED</span>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div class="flex items-center gap-3">
                                    <i class="fa-solid fa-building-user text-emerald-600"></i>
                                    <span class="text-sm font-bold text-slate-800">Head of Department (HOD)</span>
                                </div>
                                <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full"><i class="fa-solid fa-check-circle mr-1"></i> CLEARED</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- STUDENT PROFILE VIEW -->
                <div id="view-profile" class="hidden space-y-6">
                    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-xl mx-auto space-y-4">
                        <div class="text-center">
                            <div class="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black text-3xl mx-auto mb-3 shadow-inner" id="profile-avatar">
                                ST
                            </div>
                            <h3 class="text-xl font-extrabold text-slate-900" id="profile-name">Student Name</h3>
                            <p class="text-xs text-indigo-600 font-bold font-mono" id="profile-reg">Registration ID</p>
                        </div>
                        <div class="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
                            <div class="flex justify-between"><span class="text-slate-500">Roll Number:</span><span class="font-bold text-slate-800 font-mono" id="profile-roll">-</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Authentication Method:</span><span class="font-semibold text-slate-800" id="profile-auth-type">-</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Contact Handle:</span><span class="font-semibold text-slate-800" id="profile-handle">-</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Verification Status:</span><span class="font-bold text-emerald-600"><i class="fa-solid fa-circle-check"></i> Active Student</span></div>
                        </div>
                    </div>
                </div>

                <!-- SETTINGS VIEW -->
                <div id="view-settings" class="hidden space-y-6">
                    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-xl mx-auto space-y-4">
                        <h3 class="text-lg font-bold text-slate-900">Portal Preferences & Settings</h3>
                        <div class="space-y-3 text-sm">
                            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span>SMS Notifications for Complaint Status</span>
                                <input type="checkbox" checked class="w-4 h-4 text-indigo-600 rounded">
                            </div>
                            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span>High-Priority Security Alerts</span>
                                <input type="checkbox" checked class="w-4 h-4 text-indigo-600 rounded">
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>

        <!-- FOOTER -->
        <footer class="bg-slate-950 text-slate-400 text-xs py-6 mt-12 border-t border-slate-800">
            <div class="max-w-7xl mx-auto px-4 text-center space-y-1">
                <p class="font-semibold text-slate-300">Campus 360° ERP & Operational Portal</p>
                <p class="text-[11px] text-slate-500">&copy; 2026 Campus Governance Platform. All rights reserved.</p>
            </div>
        </footer>

    </div>

    <script>
        // Global Application State
        const state = {
            authenticated: false,
            primaryMethod: null, // 'Gmail' or 'Phone OTP'
            primaryHandle: '',
            studentVerified: false,
            studentProfile: {
                regId: '',
                fullName: '',
                rollNo: ''
            },
            role: 'Student', // 'Student' or 'Admin'
            selectedStarRating: 5,
            tickets: [
                {
                    id: 'CMP-9482',
                    section: 'Campus',
                    category: 'Street Lights / Lighting',
                    studentName: 'Rahul Sharma',
                    regId: 'REG2026-9042',
                    rollNo: '210543201',
                    location: 'Main Pathway near Block B',
                    description: 'Street light broken near library crossway.',
                    photoUrl: null,
                    status: 'In Progress',
                    timestamp: '2026-10-01 03:15',
                    videoUrl: null
                },
                {
                    id: 'SEC-7712',
                    section: 'Security',
                    category: 'Theft / Lost Property',
                    studentName: 'Rahul Sharma',
                    regId: 'REG2026-9042',
                    rollNo: '210543201',
                    location: 'Library 2nd Floor Reading Room',
                    description: 'Black laptop pouch misplaced near desk #14 around 2 PM.',
                    photoUrl: null,
                    status: 'Resolved',
                    timestamp: '2026-09-30 14:20',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                }
            ],
            messPolls: [
                { id: 1, option: 'Option A: North Indian Thali + Paneer Special', votes: 142 },
                { id: 2, option: 'Option B: South Indian Combo + Special Dosa', votes: 98 },
                { id: 3, option: 'Option C: Chinese Combo + Fried Rice', votes: 64 }
            ]
        };

        function switchLoginTab(tab) {
            state.primaryMethod = tab;
            const gmailBtn = document.getElementById('tab-btn-gmail');
            const phoneBtn = document.getElementById('tab-btn-phone');
            const gmailPanel = document.getElementById('panel-login-gmail');
            const phonePanel = document.getElementById('panel-login-phone');

            if(tab === 'gmail') {
                gmailBtn.className = "flex-1 py-2.5 rounded-lg bg-white shadow-sm text-indigo-900 text-center font-bold transition";
                phoneBtn.className = "flex-1 py-2.5 rounded-lg text-slate-600 text-center font-bold transition hover:text-slate-900";
                gmailPanel.classList.remove('hidden');
                phonePanel.classList.add('hidden');
            } else {
                phoneBtn.className = "flex-1 py-2.5 rounded-lg bg-white shadow-sm text-indigo-900 text-center font-bold transition";
                gmailBtn.className = "flex-1 py-2.5 rounded-lg text-slate-600 text-center font-bold transition hover:text-slate-900";
                phonePanel.classList.remove('hidden');
                gmailPanel.classList.add('hidden');
            }
        }

        function handlePrimaryLogin(type) {
            if(type === 'gmail') {
                const email = document.getElementById('login-gmail-input').value.trim();
                if(!email) {
                    showToast('Please enter a valid Gmail address', 'error');
                    return;
                }
                state.primaryHandle = email;
                state.primaryMethod = 'Gmail';
            }
            
            state.authenticated = true;
            showToast('Primary Login Successful! Complete mandatory verification.', 'success');
            
            // Show mandatory student details modal
            document.getElementById('view-login').classList.add('hidden');
            document.getElementById('modal-student-verify').classList.remove('hidden');
        }

        function handlePhoneOTPFlow() {
            const phone = document.getElementById('login-phone-input').value.trim();
            const otpContainer = document.getElementById('otp-container');
            const actionBtn = document.getElementById('phone-action-btn');

            if(otpContainer.classList.contains('hidden')) {
                if(!phone || phone.length < 10) {
                    showToast('Enter a valid 10-digit mobile number', 'error');
                    return;
                }
                otpContainer.classList.remove('hidden');
                actionBtn.innerHTML = `<i class="fa-solid fa-key"></i> Verify OTP & Proceed`;
                showToast('OTP Sent! (Simulated OTP: 123456)', 'info');
            } else {
                const otp = document.getElementById('login-otp-input').value.trim();
                if(otp !== '123456') {
                    showToast('Invalid OTP! Use 123456', 'error');
                    return;
                }
                state.primaryHandle = '+91 ' + phone;
                state.primaryMethod = 'Phone OTP';
                handlePrimaryLogin('phone_verified');
            }
        }

        function submitStudentRegistration(e) {
            e.preventDefault();
            const regId = document.getElementById('reg-id-input').value.trim().toUpperCase();
            const fullName = document.getElementById('reg-name-input').value.trim();
            const rollNo = document.getElementById('reg-roll-input').value.trim();

            if(!regId || !fullName || !rollNo) {
                showToast('All fields are mandatory!', 'error');
                return;
            }

            state.studentProfile = { regId, fullName, rollNo };
            state.studentVerified = true;

            // UNLOCK Hamburger Menu (Three Lines ☰)
            const hamburgerBtn = document.getElementById('hamburger-btn');
            hamburgerBtn.disabled = false;
            hamburgerBtn.title = "Open Navigation Menu";
            hamburgerBtn.className = "p-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white cursor-pointer transition focus:outline-none";

            // Hide verification modal, show portal views
            document.getElementById('modal-student-verify').classList.add('hidden');
            document.getElementById('main-portal-content').classList.remove('hidden');

            updateProfileUI();
            renderTickets();
            renderMessPolls();
            navigateTo('home');
            showToast(`Welcome ${fullName}! Navigation Unlocked.`, 'success');
        }

        function updateProfileUI() {
            const name = state.studentProfile.fullName || 'Student';
            const reg = state.studentProfile.regId || 'N/A';
            
            document.getElementById('user-pill').classList.remove('hidden');
            document.getElementById('nav-student-name').innerText = name;
            document.getElementById('drawer-student-name').innerText = name;
            document.getElementById('drawer-student-id').innerText = `Reg: ${reg}`;
            document.getElementById('dashboard-welcome-heading').innerText = `Welcome, ${name}`;

            // Profile view update
            document.getElementById('profile-name').innerText = name;
            document.getElementById('profile-reg').innerText = `Reg ID: ${reg}`;
            document.getElementById('profile-roll').innerText = state.studentProfile.rollNo;
            document.getElementById('profile-auth-type').innerText = state.primaryMethod || 'Google / Phone';
            document.getElementById('profile-handle').innerText = state.primaryHandle || 'N/A';

            // Gatepass update
            document.getElementById('gp-name').innerText = name;
            document.getElementById('gp-id').innerText = `Reg ID: ${reg}`;
            document.getElementById('gp-timestamp').innerText = `Pass Generated: ${new Date().toLocaleString()}`;
        }

        function navigateTo(viewId) {
            if(!state.studentVerified && viewId !== 'login') {
                document.getElementById('modal-student-verify').classList.remove('hidden');
                return;
            }

            const views = ['home', 'campus', 'academic', 'hostel', 'mess', 'security', 'tickets', 'profile', 'gatepass', 'nodues', 'settings'];
            views.forEach(v => {
                const el = document.getElementById(`view-${v}`);
                if(el) el.classList.add('hidden');
            });

            const activeView = document.getElementById(`view-${viewId}`);
            if(activeView) activeView.classList.remove('hidden');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function toggleDrawer(open) {
            if(!state.studentVerified) {
                showToast('Please complete verification first!', 'error');
                return;
            }

            const drawer = document.getElementById('drawer');
            const overlay = document.getElementById('drawer-overlay');
            if(open) {
                drawer.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            } else {
                drawer.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            }
        }

        function drawerNavigate(viewId) {
            toggleDrawer(false);
            navigateTo(viewId);
        }

        function logoutPrimary() {
            state.authenticated = false;
            state.studentVerified = false;
            
            // Re-lock hamburger menu
            const hamburgerBtn = document.getElementById('hamburger-btn');
            hamburgerBtn.disabled = true;
            hamburgerBtn.title = "Complete Login & Verification first";
            hamburgerBtn.className = "p-2 rounded-lg bg-indigo-900/40 text-slate-500 cursor-not-allowed opacity-50 transition";

            document.getElementById('main-portal-content').classList.add('hidden');
            document.getElementById('modal-student-verify').classList.add('hidden');
            document.getElementById('view-login').classList.remove('hidden');
            toggleDrawer(false);
            showToast('Logged out successfully', 'info');
        }

        function toggleRole() {
            state.role = state.role === 'Student' ? 'Admin' : 'Student';
            document.getElementById('current-role-label').innerText = `Mode: ${state.role}`;
            showToast(`Switched to ${state.role} Mode`, 'info');
            renderTickets();
        }

        function previewImage(event, previewId) {
            const file = event.target.files[0];
            const container = document.getElementById(previewId);
            if(file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    container.querySelector('img').src = e.target.result;
                    container.classList.remove('hidden');
                }
                reader.readAsDataURL(file);
            }
        }

        function handleTicketSubmit(e, section) {
            e.preventDefault();
            
            let category = 'General';
            let desc = '';
            let location = '-';
            let photoUrl = null;

            if(section === 'Campus') {
                category = document.getElementById('campus-category').value;
                location = document.getElementById('campus-location').value;
                desc = document.getElementById('campus-desc').value;
                const photoInput = document.getElementById('campus-photo-file');
                if(photoInput.files && photoInput.files[0]) {
                    photoUrl = URL.createObjectURL(photoInput.files[0]);
                }
            } else if(section === 'Academic') {
                category = document.getElementById('academic-category').value;
                desc = document.getElementById('academic-desc').value;
            } else if(section === 'Hostel') {
                category = document.getElementById('hostel-category').value;
                location = document.getElementById('hostel-room').value;
                desc = document.getElementById('hostel-desc').value;
            } else if(section === 'Mess') {
                category = 'Mess Quality / Hygiene';
                desc = document.getElementById('mess-desc').value;
            } else if(section === 'Security') {
                category = document.getElementById('security-type').value;
                location = document.getElementById('security-location').value;
                desc = document.getElementById('security-desc').value;
            }

            const prefix = section === 'Campus' ? 'CMP' :
                           section === 'Academic' ? 'ACD' :
                           section === 'Hostel' ? 'HST' :
                           section === 'Mess' ? 'MSS' : 'SEC';

            const newTicket = {
                id: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
                section: section,
                category: category,
                studentName: state.studentProfile.fullName,
                regId: state.studentProfile.regId,
                rollNo: state.studentProfile.rollNo,
                location: location,
                description: desc,
                photoUrl: photoUrl,
                status: 'Pending',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                videoUrl: section === 'Security' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : null
            };

            state.tickets.unshift(newTicket);
            e.target.reset();
            
            // Hide image preview if exists
            const imgPreview = document.getElementById('campus-photo-preview');
            if(imgPreview) imgPreview.classList.add('hidden');

            renderTickets();
            showToast(`Complaint ${newTicket.id} Submitted! 24hr SLA Clock Active.`, 'success');
            navigateTo('tickets');
        }

        function updateTicketStatus(ticketId, newStatus) {
            const ticket = state.tickets.find(t => t.id === ticketId);
            if(ticket) {
                ticket.status = newStatus;
                renderTickets();
                showToast(`Complaint ${ticketId} updated to ${newStatus}`, 'info');
            }
        }

        function renderTickets() {
            const container = document.getElementById('all-tickets-container');
            const recentContainer = document.getElementById('recent-tickets-list');

            if(!container) return;

            let html = '';
            let recentHtml = '';

            if(state.tickets.length === 0) {
                html = `<p class="text-sm text-slate-500 text-center py-6">No complaints logged yet.</p>`;
            }

            state.tickets.forEach(t => {
                const statusColor = t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                    t.status === 'In Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                    'bg-indigo-100 text-indigo-800 border-indigo-300';

                html += `
                    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div class="flex items-center gap-2">
                                <span class="font-extrabold text-indigo-950 font-mono text-base">${t.id}</span>
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}">${t.status}</span>
                                <span class="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">${t.section}</span>
                            </div>
                            <span class="text-xs text-slate-400 font-mono"><i class="fa-regular fa-clock"></i> ${t.timestamp} (24hr SLA Active)</span>
                        </div>

                        <div class="text-xs text-slate-600 space-y-1">
                            <p><strong class="text-slate-800">Category:</strong> ${t.category}</p>
                            <p><strong class="text-slate-800">Student:</strong> ${t.studentName} (Reg: ${t.regId} | Roll: ${t.rollNo})</p>
                            ${t.location !== '-' ? `<p><strong class="text-slate-800">Location:</strong> ${t.location}</p>` : ''}
                            <p class="text-slate-800 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">${t.description}</p>
                        </div>

                        ${t.photoUrl ? `
                            <div class="mt-2">
                                <p class="text-[11px] font-bold text-slate-500 mb-1">Uploaded Evidence Photo:</p>
                                <img src="${t.photoUrl}" class="h-36 rounded-xl object-cover border border-slate-200 shadow-sm">
                            </div>
                        ` : ''}

                        ${t.videoUrl && t.status === 'Resolved' ? `
                            <div class="mt-3 bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-2">
                                <p class="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                    <i class="fa-solid fa-circle-play text-purple-600 text-sm"></i> Official CCTV Video Stream Attached:
                                </p>
                                <video controls class="w-full max-h-56 rounded-xl bg-black shadow-inner">
                                    <source src="${t.videoUrl}" type="video/mp4">
                                    Your browser does not support video play.
                                </video>
                            </div>
                        ` : ''}

                        ${state.role === 'Admin' ? `
                            <div class="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 text-xs">
                                <span class="font-bold text-slate-700">Admin Controls:</span>
                                <button onclick="updateTicketStatus('${t.id}', 'Assigned')" class="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-bold">Assign Staff</button>
                                <button onclick="updateTicketStatus('${t.id}', 'In Progress')" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold">In Progress</button>
                                <button onclick="updateTicketStatus('${t.id}', 'Resolved')" class="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold">Mark Resolved</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            // Recent Complaints for Dashboard
            state.tickets.slice(0, 3).forEach(t => {
                recentHtml += `
                    <div class="py-3 flex items-center justify-between">
                        <div>
                            <p class="font-bold text-sm text-slate-800">${t.id} - ${t.category}</p>
                            <p class="text-xs text-slate-500">${t.section} • ${t.timestamp}</p>
                        </div>
                        <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">${t.status}</span>
                    </div>
                `;
            });

            container.innerHTML = html;
            recentContainer.innerHTML = recentHtml || `<p class="text-xs text-slate-400 py-2">No active complaints logged.</p>`;
        }

        function setMessRating(stars) {
            state.selectedStarRating = stars;
            const container = document.getElementById('mess-star-rating');
            const icons = container.querySelectorAll('i');
            icons.forEach((icon, idx) => {
                if(idx < stars) {
                    icon.className = 'fa-solid fa-star text-amber-400';
                } else {
                    icon.className = 'fa-solid fa-star text-slate-300';
                }
            });
            showToast(`Rated Mess Food: ${stars} Stars`, 'info');
        }

        function voteMessPoll(pollId) {
            const option = state.messPolls.find(p => p.id === pollId);
            if(option) {
                option.votes += 1;
                renderMessPolls();
                showToast('Vote Registered for Menu Poll!', 'success');
            }
        }

        function renderMessPolls() {
            const container = document.getElementById('mess-poll-container');
            if(!container) return;

            const totalVotes = state.messPolls.reduce((sum, item) => sum + item.votes, 0);

            let html = '';
            state.messPolls.forEach(p => {
                const percent = totalVotes > 0 ? Math.round((p.votes / totalVotes) * 100) : 0;
                html += `
                    <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div class="flex justify-between items-center text-xs font-bold text-slate-800">
                            <span>${p.option}</span>
                            <span class="text-purple-700">${percent}% (${p.votes} votes)</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div class="bg-purple-600 h-2 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                        </div>
                        <button onclick="voteMessPoll(${p.id})" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 mt-1">
                            <i class="fa-solid fa-check text-xs"></i> Vote This Option
                        </button>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const bgClass = type === 'success' ? 'bg-emerald-600' :
                            type === 'error' ? 'bg-red-600' : 'bg-indigo-600';

            toast.className = `${bgClass} text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 pointer-events-auto transition duration-300`;
            toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;

            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-x-4');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Initial Window Load Initialization
        window.onload = function() {
            renderMessPolls();
            renderTickets();
        };
    </script>
</body>
</html>
