/* ==========================================================================
   MOTOR DE INTERACCIONES, ANIMACIONES 3D Y PORTAL INMERSIVO - TRES GATOS
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // INSTANCIACIÓN DE VARIABLES DE CONTROL GLOBAL PARA REBOTES ISOMÉTRICOS
    const navDots = document.querySelectorAll(".navbar-bouncing-dots .nav-dot");
    let globalReboteTimeline = null;

    // Forzamos el registro de la librería de scroll de GSAP
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================================================
    // MOTOR PORTAL CINEMÁTICO UNIFICADO: CONTRALOR ELÁSTICO DE SCROLL (PC Y MÓVIL)
    // ==========================================================================
    
    // Forzamos a que la web de abajo esté disponible en el flujo para que el navegador mida la altura real
    gsap.set(".content-wrapper-delayed", { opacity: 0, visibility: "visible", display: "block" });
    gsap.set(".portal-container", { opacity: 1, display: "block", visibility: "visible" });
    
    // PARACHOQUES DE HARDWARE: Asegura que el contenedor del astronauta sea visible inmediatamente en móviles
    gsap.set(".portal-totem-frame, .portal-screen-content", { opacity: 1, visibility: "visible", scale: 1 });
    
    window.scrollTo(0, 0);

    // Calculamos la fuerza del despegue según el tamaño del dispositivo
    const recorridoScroll = window.innerWidth > 768 ? "+=1600" : "+=900";

    const portalTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".portal-viewport",
            start: "top top",
            end: recorridoScroll,  // Recorrido elástico calibrado por hardware
            scrub: 1.2,            // Sincronización directa y fluida con el movimiento del dedo
            pin: true,             // Bloquea la pantalla obligatoriamente mientras se hace el despegue
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // Si el usuario está en el celular y regresa al puro techo, aseguramos el reseteo visual
                if (self.progress === 0 && window.innerWidth <= 768) {
                    gsap.set(".navbar", { opacity: 0, y: -20 });
                    ejecutarShowBouncingDotsNav();
                }
            }
        }
    });

    // 1. EL LOGO INFERIOR CAE AL SUELO POR PROPIEDAD TOP NATIVA
    portalTl.to(".portal-intro-text", { 
        top: "150%",      // Desplaza el contenedor completo por debajo de la pantalla
        opacity: 0,      
        duration: 1, 
        ease: "none"     
    })
    
    // 2. EL ASTRONAUTA ULTRA-GIGANTE DESPEGA VERTICALMENTE AL CIELO CON EL SCROLL
    .to(".portal-totem-frame", { 
        yPercent: -130,     // Despegue continuo hacia el espacio exterior sincronizado con el dedo
        duration: 1, 
        ease: "none"     
    }, "<")                // Arranca en paralelo exacto con el logo inferior
    
    // 3. EL TEXTO ESCALONADO SE DESVANECE EN SU SITIO TOTALMENTE QUIETO
    .to(".portal-staggered-title", {
        opacity: 0,      
        scale: 0.95,        // Sutil efecto de alejamiento espacial
        duration: 0.6,   
        ease: "none"
    }, "<")              
    
    // 4. TRANSICIÓN FINAL: Desvanece la capa del portal y le da el paso a la web principal
    .to(".portal-container", { 
        opacity: 0, 
        display: "none", 
        pointerEvents: "none", 
        duration: 0.3 
    })
    
    // 5. ENCIENDE LA WEB PRINCIPAL DE PRODUCCIÓN EN ORDEN NATURAL DESDE ARRIBA
    .to(".content-wrapper-delayed", { 
        opacity: 1, 
        duration: 0.4 
    }, "-=0.15")
    
    // 6. REVELA LA NAVBAR CON LOS PUNTITOS SALTANINES EN LA CABECERA
    .to(".navbar", { 
        opacity: 1, 
        y: 0, 
        duration: 0.4, 
        ease: "power3.out", 
        onComplete: ejecutarShowBouncingDotsNav 
    }, "-=0.15");

    // ==========================================================================
    // FUNCIÓN DE DISPARO RADIAL: REBOTE ELÁSTICO (FÍSICA COMPLETA DEL VIDEO)
    // ==========================================================================
    function ejecutarShowBouncingDotsNav() {
        if (globalReboteTimeline) globalReboteTimeline.kill();
        
        gsap.set(".navbar-bouncing-dots", { display: "flex" });
        gsap.set(navDots, { x: 0, y: 0, scale: 1, opacity: 1 });
        gsap.set(".logo-neon-prominent", { opacity: 0, scale: 0.7, filter: "none" });

        navDots.forEach((punto, indice) => {
            const reboteIndividualTl = gsap.timeline({ repeat: 2 }); 
            const delayPorHardware = indice * 0.14; 

            reboteIndividualTl.delay(delayPorHardware)
                .to(punto, { y: -35, scaleY: 1.25, scaleX: 0.85, duration: 0.3, ease: "power2.out" })
                .to(punto, { y: 0, scaleY: 1, scaleX: 1, duration: 0.25, ease: "power2.in" })
                .to(punto, { scaleY: 0.6, scaleX: 1.4, duration: 0.07, ease: "power1.out" })
                .to(punto, { scaleY: 1, scaleX: 1, duration: 0.07, ease: "power1.inOut" });
        });

        globalReboteTimeline = gsap.timeline()
            .delay(1.7) 
            .to(".navbar-bouncing-dots .nav-dot", {
                x: (i) => (i === 0 ? 38 : i === 2 ? -38 : 0), 
                scale: 0.1, opacity: 0, duration: 0.4, ease: "power3.inOut"
            })
            .to(".logo-neon-prominent", {
                opacity: 1, 
                scale: 1, 
                duration: 0.6, 
                ease: "back.out(1.5)",
                onStart: () => {
                    const logo = document.querySelector(".logo-neon-prominent");
                    if (logo) logo.style.filter = "drop-shadow(0 0 15px #00f2fe) drop-shadow(0 0 30px #a855f7)";
                }
            }, "-=0.2")
            .to(".navbar-bouncing-dots", { display: "none", duration: 0.1 });
    }

    // ==========================================================================
    // RASTREADOR DE RE-ENTRADA EN TECHO GLOBAL
    // ==========================================================================
    let seHaEjecutadoEnTecho = true;
    window.addEventListener("scroll", () => {
        if (window.scrollY === 0) {
            if (!seHaEjecutadoEnTecho) {
                seHaEjecutadoEnTecho = true;
                ScrollTrigger.refresh(); // Sincroniza los hilos de hardware de GSAP
            }
        } else {
            seHaEjecutadoEnTecho = false;
        }
    });

    // MENÚ HAMBURGUESA
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            menuToggle.classList.toggle("open");
        });
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                menuToggle.classList.remove("open");
            });
        });
    }

    // ==========================================================================
    // SISTEMA CARRUSEL 3D: MOTOR ULTRA-FLUIDO CON FILTRO ANTI-ENGANCHE NATIVO
    // ==========================================================================
    const stage3D = document.querySelector(".carousel-stage");
    const wrapper3D = document.querySelector(".carousel-3d-wrapper");
    const tótems = document.querySelectorAll(".carousel-card");

    if (stage3D && wrapper3D && tótems.length > 0) {
        const totalTotems = tótems.length;
        const anguloPorTarjeta = 360 / totalTotems;
        const radioCilindro = window.innerWidth > 768 ? 320 : 150; 

        // Posicionamiento físico inicial de los tótems en el cilindro 3D
        tótems.forEach((totem, indice) => {
            const anguloRotacion = indice * anguloPorTarjeta;
            totem.style.transform = `rotateY(${anguloRotacion}deg) translateZ(${radioCilindro}px)`;
            
            // CANDADO EXTRA EN EL DOM: Evita que el navegador intente arrastrar las imágenes/links
            totem.setAttribute("draggable", "false");
            totem.querySelectorAll("img, a, span").forEach(el => el.setAttribute("draggable", "false"));
        });

        let rotacionActualY = 0;
        let mouseXInicio = 0;
        let estaArrastrando = false;
        let rotacionBase = 0;
        let pilotoAutomatedActive = true;
        let velocidadPiloto = -0.12; 
        let requestIDPiloto = null; 

        // Bucle del piloto automático de rotación continua
        function loopPilotoAutomatico() {
            if (pilotoAutomatedActive && !estaArrastrando) {
                rotacionActualY += velocidadPiloto;
                gsap.set(wrapper3D, { rotateY: rotacionActualY });
                requestIDPiloto = requestAnimationFrame(loopPilotoAutomatico);
            }
        }
        // Encendido inicial del piloto automático
        requestIDPiloto = requestAnimationFrame(loopPilotoAutomatico);

        // CLIC SOSTENIDO: Apaga el piloto automático y frena el bucle de inmediato
        const iniciarArrastre = (e) => {
            if (e.type === "mousedown") {
                e.preventDefault(); 
            }
            
            estaArrastrando = true;
            pilotoAutomatedActive = false; 
            
            if (requestIDPiloto) {
                cancelAnimationFrame(requestIDPiloto);
                requestIDPiloto = null;
            }
            gsap.killTweensOf(wrapper3D); 

            mouseXInicio = e.clientX || (e.touches && e.touches[0].clientX); 
            rotacionBase = rotacionActualY;
        };

        // MOVIMIENTO: Permite arrastrar el carrusel libremente con el mouse o dedo
        const moverArrastre = (e) => {
            if (!estaArrastrando) return;
            const clienteX = e.clientX || (e.touches && e.touches[0].clientX);
            const diferenciaX = clienteX - mouseXInicio;
            
            rotacionActualY = rotacionBase + (diferenciaX * 0.28); 
            gsap.set(wrapper3D, { rotateY: rotacionActualY });
        };

        // AL SOLTAR EL CLIC: Libera el carrusel al instante sin enganches residuales
        const finalizarArrastre = () => {
            if (!estaArrastrando) return;
            estaArrastrando = false; 
            
            // Acomoda el carrusel en la tarjeta más cercana de forma matemática
            const cuadranteDestino = Math.round(rotacionActualY / anguloPorTarjeta) * anguloPorTarjeta;
            
            gsap.to(wrapper3D, { 
                rotateY: cuadranteDestino, 
                duration: 0.5, 
                ease: "power2.out", 
                onComplete: () => { 
                    rotacionActualY = cuadranteDestino; 
                    pilotoAutomatedActive = true; 
                    
                    if (!requestIDPiloto) {
                        requestIDPiloto = requestAnimationFrame(loopPilotoAutomatico);
                    }
                } 
            });
        };

        // Escuchadores de eventos amarrados a la ventana global para capturar la suelta SÍ O SÍ
        stage3D.addEventListener("mousedown", iniciarArrastre);
        window.addEventListener("mousemove", moverArrastre);
        window.addEventListener("mouseup", finalizarArrastre);
        
        // Soporte para dispositivos móviles táctiles
        stage3D.addEventListener("touchstart", iniciarArrastre, { passive: true });
        window.addEventListener("touchmove", moverArrastre, { passive: true });
        window.addEventListener("touchend", finalizarArrastre);

        // Si el mouse se sale del navegador o pierde el foco, se suelta solo al instante
        window.addEventListener("mouseleave", finalizarArrastre);
        window.addEventListener("blur", finalizarArrastre);
    }

    // GESTIÓN CONSOLA INTERACTIVA
    const tabBotones = document.querySelectorAll('.console-tab-item');
    const screenCards = document.querySelectorAll('.screen-view-card');
    const panelDerechoVisual = document.querySelector('.console-panel-right');

    if (tabBotones.length > 0 && screenCards.length > 0) {
        tabBotones.forEach(boton => {
            boton.addEventListener('click', () => {
                tabBotones.forEach(b => b.classList.remove('active'));
                boton.classList.add('active');

                const targetId = boton.getAttribute('data-target');

                screenCards.forEach(card => {
                    card.classList.remove('active');
                    if (card.id === `view-${targetId}`) {
                        card.classList.add('active');
                        gsap.fromTo(card.querySelector('.view-visual-demo'), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" });
                        gsap.fromTo(card.querySelectorAll('.view-info-text > *'), { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" });
                    }
                });

                if (window.innerWidth <= 1024 && panelDerechoVisual) {
                    panelDerechoVisual.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
    }

    // MULTI-COLOR AMBIENTAL
    const tarjetasServicios = document.querySelectorAll(".portfolio-card");
    const auroraFondo = document.querySelector(".background-glow");

    if (tarjetasServicios.length > 0 && auroraFondo) {
        tarjetasServicios.forEach(tarjeta => {
            tarjeta.addEventListener("mouseenter", () => {
                const colorGlowColor = tarjeta.getAttribute("data-color-glow");
                gsap.to(auroraFondo, { background: `radial-gradient(circle at 50% 50%, ${colorGlowColor} 0%, transparent 60%)`, duration: 0.6, ease: "power2.out" });
            });
            tarjeta.addEventListener("mouseleave", () => {
                gsap.to(auroraFondo, { background: `radial-gradient(circle at 15% 25%, rgba(0, 242, 254, 0.14) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(168, 85, 247, 0.14) 0%, transparent 45%)`, duration: 0.6, ease: "power2.out" });
            });
        });
    }

    // RED DE NODOS CANVAS
    const canvas = document.getElementById("network-canvas");
    const ctx = canvas.getContext("2d");
    let nodos = [];
    const mouse = { x: null, y: null, maxDistancia: 175 };

    function ajustarCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; inicializarNodos(); }

    class Nodo {
        constructor(x, y) { this.x = x; this.y = y; this.vX = (Math.random() - 0.5) * 0.45; this.vY = (Math.random() - 0.5) * 0.45; this.radius = Math.random() * 2.5 + 1.5; }
        actualizar() { this.x += this.vX; this.y += this.vY; if (this.x < 0 || this.x > canvas.width) this.vX *= -1; if (this.y < 0 || this.y > canvas.height) this.vY *= -1; }
        dibujar() { ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = "rgba(255, 255, 255, 0.22)"; ctx.fill(); }
    }

    function inicializarNodos() {
        nodos = []; const numeroNodos = Math.floor((canvas.width * canvas.height) / 9000);
        for (let i = 0; i < Math.min(numeroNodos, 110); i++) { nodos.push(new Nodo(Math.random() * canvas.width, Math.random() * canvas.height)); }
    }

    function trazarConexiones() {
        for (let i = 0; i < nodos.length; i++) {
            nodos[i].actualizar(); nodos[i].dibujar();
            if (mouse.x !== null && mouse.y !== null) {
                const dX = nodos[i].x - mouse.x; const dY = nodos[i].y - mouse.y; const dist = Math.sqrt(dX * dX + dY * dY);
                if (dist < mouse.maxDistancia) {
                    const opacidad = (1 - (dist / mouse.maxDistancia)) * 0.45;
                    ctx.beginPath(); ctx.moveTo(nodos[i].x, nodos[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.strokeStyle = `rgba(168, 85, 247, ${opacidad})`; ctx.lineWidth = 1; ctx.stroke();
                }
            }
        }
    }

    document.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX; mouse.y = e.clientY;
        const mouseX = e.clientX / window.innerWidth; const mouseY = e.clientY / window.innerHeight;
        gsap.to(".background-glow", { duration: 3, x: (mouseX - 0.5) * 60, y: (mouseY - 0.5) * 60, ease: "power2.out" });
    });

    function bucleNodos() { ctx.clearRect(0, 0, canvas.width, canvas.height); trazarConexiones(); requestAnimationFrame(bucleNodos); }
    ajustarCanvas(); window.addEventListener("resize", ajustarCanvas); requestAnimationFrame(bucleNodos);

    // PERSPECTIVA TILT LOGO NAV
    const logoNavbarProminent = document.querySelector(".logo-neon-prominent");
    if (logoNavbarProminent) {
        logoNavbarProminent.addEventListener("mousemove", (e) => {
            const rect = logoNavbarProminent.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const tX = x - (rect.width / 2); const tY = y - (rect.height / 2);
            gsap.to(logoNavbarProminent, { duration: 0.3, rotateX: -tY * 0.15, rotateY: tX * 0.15, transformPerspective: 600, ease: "power2.out" });
        });
        logoNavbarProminent.addEventListener("mouseleave", () => {
            gsap.to(logoNavbarProminent, { duration: 0.6, rotateX: 0, rotateY: 0, ease: "elastic.out(1, 0.5)" });
        });
    }

    // TAMAÑO DEL LOGO EN SCROLL
    window.addEventListener("scroll", () => {
        const logo = document.querySelector(".logo-neon-prominent"); if (!logo) return;
        if (window.scrollY > 50) { if (window.innerWidth > 992) gsap.to(logo, { height: "75px", transform: "translateY(-50%)", duration: 0.3, ease: "power2.out" }); }
        else { if (window.innerWidth > 992) gsap.to(logo, { height: "125px", transform: "translateY(-44%)", duration: 0.3, ease: "power2.out" }); }
    });

    // CONTADORES NUMÉRICOS AUTOMÁTICOS ACTIVADOS POR SELECTOR CONTADOR-NEON
    const contadoresNeon = document.querySelectorAll(".contador-neon");
    contadoresNeon.forEach(contador => {
        const valorFinal = parseInt(contador.getAttribute("data-count"));
        
        ScrollTrigger.create({
            trigger: ".metricas-section", 
            start: "top 80%",
            onEnter: () => {
                let objetoContador = { value: 0 };
                gsap.to(objetoContador, { 
                    value: valorFinal, 
                    duration: 2.5, 
                    ease: "power3.out", 
                    onUpdate: () => { 
                        contador.innerText = Math.floor(objetoContador.value).toLocaleString('es-CO'); 
                    } 
                });
            }
        });
    });

    // ==========================================================================
    // DISPARADORES RECURRENTES EN SCROLL VENTAJAS (CON FILTRO DE LIMPIEZA CLEARPROPS)
    // ==========================================================================
    if (window.innerWidth > 768) {
        gsap.from(".logo-neon-trigger-left", {
            scrollTrigger: { 
                trigger: ".ventajas-section", 
                start: "top 85%", 
                end: "bottom 15%", 
                toggleActions: "restart reverse restart reverse" 
            },
            x: -300, 
            opacity: 0, 
            duration: 1.2, 
            stagger: 0.2, 
            ease: "back.out(1.1)",
            onComplete: () => {
                // EL CANDADO MAESTRO PARA PC: Limpia la propiedad inline al finalizar para evitar atasques a la izquierda
                gsap.set(".logo-neon-trigger-left", { clearProps: "transform,x" }); 
            }
        });
    } else {
        gsap.from(".logo-neon-trigger-left", {
            scrollTrigger: { 
                trigger: ".ventajas-section", 
                start: "top 90%", 
                end: "bottom 10%", 
                toggleActions: "restart reverse restart reverse" 
            },
            x: -150, 
            opacity: 0, 
            duration: 0.8, 
            stagger: 0.15, 
            ease: "power2.out",
            onComplete: () => {
                gsap.set(".logo-neon-trigger-left", { clearProps: "transform,x" }); 
            }
        });
    }

    gsap.from(".logo-neon-trigger-fade-up", {
        scrollTrigger: { trigger: ".ventajas-section", start: "top 80%", end: "bottom 20%", toggleActions: "restart reverse restart reverse" },
        y: 100, opacity: 0, duration: 1.4, ease: "power3.out"
    });

    // TILT 3D CARD ELEMENTOS
    const elementos3D = document.querySelectorAll(".animate-3d, .logo-cliente-wrapper, .console-tab-item");
    elementos3D.forEach(elemento => {
        const glow = elemento.querySelector(".spotlight-glow");
        elemento.addEventListener("mousemove", (e) => {
            const rect = elemento.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            gsap.to(elemento, { duration: 0.4, rotateX: -(y - (rect.height / 2)) * 0.04, rotateY: (x - (rect.width / 2)) * 0.04, transformPerspective: 1000, ease: "power2.out" });
            if (glow) gsap.to(glow, { duration: 0.2, left: `${x}px`, top: `${y}px`, ease: "power1.out" });
        });
        elemento.addEventListener("mouseleave", () => { gsap.to(elemento, { duration: 0.8, rotateX: 0, rotateY: 0, ease: "elastic.out(1, 0.4)" }); });
    });
});