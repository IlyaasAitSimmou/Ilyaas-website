'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const ThreeJsPlanets = () => {
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene>()
    const rendererRef = useRef<THREE.WebGLRenderer>()
    const planetsRef = useRef<THREE.Group[]>([])

    useEffect(() => {
        if (!mountRef.current) return

        // Scene setup
        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            110, // FOV in degrees
            window.innerWidth / (window.innerHeight * 3), // Correct aspect ratio for 3-section layout
            0.1,
            1000
        )
        camera.position.z = 5

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight * 3) // Use proper height for 3-section layout
        renderer.setClearColor(0x000000, 0) // Transparent background
        
        // Mobile performance optimization
        const isMobile = window.innerWidth <= 768
        if (isMobile) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Limit pixel ratio on mobile
        } else {
            renderer.setPixelRatio(window.devicePixelRatio)
        }
        
        rendererRef.current = renderer
        mountRef.current.appendChild(renderer.domElement)

        // Vertex shader for gas giant stripes
        const vertexShader = `
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            void main() {
                vUv = uv;
                vPosition = position;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `

        // Fragment shader for gas giant stripes
        const fragmentShader = `
            uniform vec3 baseColor;
            uniform float time;
            uniform float stripeFrequency;
            uniform float swirl;
            uniform int planetType; // 0=bland, 1=gas giant, 2=oceanic, 3=dry terrain
            
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            // Simple noise function
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                
                vec2 u = f * f * (3.0 - 2.0 * f);
                
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            void main() {
                // Planet type conditional rendering
                if (planetType == 0) {
                    // Bland planet - simple solid color
                    gl_FragColor = vec4(baseColor, 1.0);
                    return;
                }
                
                if (planetType == 1) {
                    // Gas Giant - Striped pattern (original code)
                    // Create latitude-based stripes with swirl
                    float latitude = vUv.y;
                    float longitude = vUv.x;
                    
                    // Add swirl effect
                    float swirlOffset = sin(latitude * 3.14159 * 2.0) * swirl;
                    float adjustedLongitude = longitude + swirlOffset + time * 0.1;
                    
                    // Create main stripe pattern
                    float stripePattern = sin(latitude * 3.14159 * stripeFrequency + time * 0.5);
                    
                    // Add secondary patterns for more detail
                    float detailPattern = sin(latitude * 3.14159 * stripeFrequency * 2.3 + adjustedLongitude * 6.28 * 3.0 + time * 0.3) * 0.3;
                    float turbulence = noise(vec2(adjustedLongitude * 10.0, latitude * 8.0 + time * 0.2)) * 0.4;
                    
                    // Combine patterns
                    float finalPattern = stripePattern + detailPattern + turbulence;
                    finalPattern = smoothstep(-0.2, 0.2, finalPattern); // Thinner stripes
                    
                    // Color variations
                    vec3 darkColor = baseColor * 0.6;
                    vec3 lightColor = baseColor * 1.2;
                    vec3 midColor = baseColor;
                    
                    // Add some color variation
                    vec3 variation = vec3(
                        sin(finalPattern * 3.14159 + 0.0) * 0.1,
                        sin(finalPattern * 3.14159 + 2.0) * 0.1,
                        sin(finalPattern * 3.14159 + 4.0) * 0.1
                    );
                    
                    // Mix colors based on pattern
                    vec3 finalColor = mix(darkColor, lightColor, finalPattern);
                    finalColor = mix(finalColor, midColor, 0.3);
                    finalColor += variation;
                    
                    // Add some atmospheric glow
                    float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    finalColor += baseColor * fresnel * 0.2;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                    return;
                }
                
                if (planetType == 2) {
                    // Oceanic planet - Continents and oceans
                    float latitude = vUv.y;
                    float longitude = vUv.x;
                    
                    // Create continent noise pattern
                    float continentNoise = noise(vec2(longitude * 8.0, latitude * 6.0));
                    float continentDetail = noise(vec2(longitude * 20.0, latitude * 15.0)) * 0.3;
                    float coastalDetail = noise(vec2(longitude * 40.0, latitude * 30.0)) * 0.15;
                    
                    float landMask = continentNoise + continentDetail + coastalDetail;
                    landMask = smoothstep(0.3, 0.5, landMask);
                    
                    // Ocean color (darker, blue-ish version of base color)
                    vec3 oceanColor = baseColor * vec3(0.3, 0.5, 0.8);
                    
                    // Land color (brighter, more saturated)
                    vec3 landColor = baseColor * vec3(1.3, 1.1, 0.8);
                    
                    // Add some terrain variation to land
                    float terrainVariation = noise(vec2(longitude * 60.0, latitude * 45.0)) * 0.2;
                    landColor += vec3(terrainVariation, terrainVariation * 0.8, terrainVariation * 0.6);
                    
                    vec3 finalColor = mix(oceanColor, landColor, landMask);
                    
                    // Add atmospheric glow
                    float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    finalColor += baseColor * fresnel * 0.15;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                    return;
                }
                
                if (planetType == 3) {
                    // Dry terrain planet - Rocky/desert patterns
                    float latitude = vUv.y;
                    float longitude = vUv.x;
                    
                    // Create terrain patterns
                    float terrainBase = noise(vec2(longitude * 12.0, latitude * 10.0));
                    float terrainDetail = noise(vec2(longitude * 30.0, latitude * 25.0)) * 0.4;
                    float rockDetail = noise(vec2(longitude * 80.0, latitude * 60.0)) * 0.2;
                    
                    float terrainPattern = terrainBase + terrainDetail + rockDetail;
                    
                    // Desert/rock color variations
                    vec3 darkTerrain = baseColor * 0.7;
                    vec3 lightTerrain = baseColor * 1.4;
                    vec3 midTerrain = baseColor * 1.1;
                    
                    // Add some color variation for different rock types
                    vec3 rockVariation = vec3(
                        sin(terrainPattern * 6.28 + 0.0) * 0.15,
                        sin(terrainPattern * 6.28 + 2.0) * 0.1,
                        sin(terrainPattern * 6.28 + 4.0) * 0.05
                    );
                    
                    vec3 finalColor = mix(darkTerrain, lightTerrain, smoothstep(0.2, 0.8, terrainPattern));
                    finalColor = mix(finalColor, midTerrain, 0.3);
                    finalColor += rockVariation;
                    
                    // Add atmospheric glow
                    float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    finalColor += baseColor * fresnel * 0.1;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                    return;
                }
                
                // Fallback to bland color
                gl_FragColor = vec4(baseColor, 1.0);
            }
        `

        // Create planets
        const createPlanet = (size: number, color: number, position: [number, number, number], rings: [number, number], stripes: any, swirl: any, planetType: number) => {
            const planetGroup = new THREE.Group()
            
            // Planet geometry
            const geometry = new THREE.SphereGeometry(size, 64, 64) // Higher resolution for better stripes
            
            // Convert color to RGB components
            const colorObj = new THREE.Color(color)
            
            // Create shader material for different planet types
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    baseColor: { value: new THREE.Vector3(colorObj.r, colorObj.g, colorObj.b) },
                    time: { value: 0.0 },
                    // stripeFrequency: { value: 3.0 + Math.random() * 4.0 }, // Original: 3-7 stripes
                    stripeFrequency: { value: stripes || 4.0 + Math.random() * 5.0 }, // More abundant: 4-9 stripes
                    swirl: { value: swirl || 0.1 + Math.random() * 0.3 }, // Random swirl amount
                    planetType: { value: planetType } // 0=bland, 1=gas giant, 2=oceanic, 3=dry terrain
                }
            })
            
            const planet = new THREE.Mesh(geometry, material)
            
            // Add some rings to some planets (cartoonish style) - independent of planet type
            if ((Math.random() > 0.5 && rings[0] == -1) || rings[0]) {
                const ringGeometry = new THREE.RingGeometry(size * 1.5, size * 2, 32)
                const ringMaterial = new THREE.MeshBasicMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                })
                const ring = new THREE.Mesh(ringGeometry, ringMaterial)
                const ringRotation = rings[1] || Math.random() * (Math.PI / 2.8 - Math.PI / 1.2) + Math.PI / 1.2;
                ring.rotation.x = ringRotation;
                planetGroup.add(ring)

                if ((Math.random() > 0.2 && rings[0] == -1) || rings[0] == 2) {
                const ringGeometry2 = new THREE.RingGeometry(size * 2.25, size * 3, 32)
                const ringMaterial2 = new THREE.MeshBasicMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                })
                const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2)
                ring2.rotation.x = ringRotation
                planetGroup.add(ring2)
            }
            }
            
            planetGroup.add(planet)
            planetGroup.position.set(...position)
            
            return planetGroup
        }

        // Create multiple planets with mobile responsiveness
        const isMobilePhone = window.innerWidth <= 480
        
        // Mobile: smaller planets, more spread out positioning
        const mobileScale = isMobilePhone ? 0.5 : 1
        const mobileSpread = isMobilePhone ? 1.8 : 1
        
        const planets = isMobilePhone ? [
            // Mobile planet layout - smaller sizes, more spread out
            createPlanet(0.8 * mobileScale, 0xff6b6b, [3.5 * mobileSpread, 1.5 * mobileSpread, -4], [2, Math.PI/2.3], 9, 0.25, 1), // Gas giant - red
            createPlanet(0.2 * mobileScale, 0xb0b0b0, [1 * mobileSpread, 6 * mobileSpread, -2], [0, Math.PI/2.7], 9, 0.2, 2), // Moon
            createPlanet(0.4 * mobileScale, 0x4ecdc4, [-6 * mobileSpread, -0.5 * mobileSpread, -3], [2, Math.PI/1.8], 9, 0.1, 3), // Oceanic
            createPlanet(0.15 * mobileScale, 0xe0e0e0, [-5 * mobileSpread, 8 * mobileSpread, -4], [0, Math.PI/2.7], 9, 0.2, 0), // Small moon
            createPlanet(0.2 * mobileScale, 0xffe8a8, [3 * mobileSpread, -5 * mobileSpread, -1], [2, Math.PI/1.8], 6, 0.2, 1), // Gas giant - yellow
            createPlanet(0.35 * mobileScale, 0x5ea3ff, [-7 * mobileSpread, 10 * mobileSpread, -4], [0, Math.PI/2.7], 9, 0.2, 3), // Terrain
            createPlanet(0.25 * mobileScale, 0xffaaa5, [6 * mobileSpread, -3 * mobileSpread, -2], [1, Math.PI/2.7], 9, 0.2, 1) // Gas giant - pink
        ] : [
            // Desktop planet layout - original
            createPlanet(1.5, 0xff6b6b, [2, 2, -4], [2, Math.PI/2.3], 9, 0.25, 1), // Gas giant - red
            createPlanet(0.3, 0xb0b0b0, [0.5, 3.5, -2], [0, Math.PI/2.7], 9, 0.2, 2), // Oceanic Moon
            createPlanet(0.7, 0x4ecdc4, [-4, -1, -3], [2, Math.PI/1.8], 9, 0.1, 3), // Oceanic - teal
            createPlanet(0.2, 0xe0e0e0, [-4, 5.5, -4], [0, Math.PI/2.7], 9, 0.2, 0), // Terrain Moon
            createPlanet(0.3, 0xffe8a8, [2, -3, -1], [2, Math.PI/1.8], 6, 0.2, 1), // Gas giant - yellow
            createPlanet(0.6, 0x5ea3ff, [-5, 6, -4], [0, Math.PI/2.7], 9, 0.2, 3), // Terrain - Blue
            createPlanet(0.4, 0xffaaa5, [4, -2, -2], [1, Math.PI/2.7], 9, 0.2, 1) // Gas giant - pink
        ]

        planets.forEach(planet => {
            scene.add(planet)
            planetsRef.current.push(planet)
        })

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate)
            
            const currentTime = Date.now() * 0.001 // Convert to seconds
            
            // Rotate planets and update shader time
            planetsRef.current.forEach((planet, index) => {
                // planet.rotation.x += 0.01
                // planet.rotation.y += 0.02
                
                // Gentle floating motion
                planet.position.y += Math.sin(currentTime + index) * 0.001
                
                // Update shader time uniform for animated stripes
                const planetMesh = planet.children.find((child: THREE.Object3D) => child instanceof THREE.Mesh) as THREE.Mesh
                if (planetMesh && planetMesh.material instanceof THREE.ShaderMaterial) {
                    planetMesh.material.uniforms.time.value = currentTime
                }
            })
            
            renderer.render(scene, camera)
        }
        animate()

        // Handle scroll to move planets
        const handleScroll = () => {
            const scrollY = window.scrollY
            const scrollProgress = scrollY / (document.body.scrollHeight - window.innerHeight)
            
            // planetsRef.current.forEach((planet, index) => {
            //     // Move planets as user scrolls
            //     // planet.position.x += Math.sin(scrollProgress * Math.PI + index) * 0.01
            //     // planet.position.z = -2 - scrollProgress * 3
                
            //     // Fade in/out based on scroll position
            //     const mesh = planet.children.find((child: THREE.Object3D) => child instanceof THREE.Mesh)
            //     // if (mesh && mesh.material instanceof THREE.MeshBasicMaterial) {
            //     //     mesh.material.opacity = Math.max(0.2, 0.8 - scrollProgress)
            //     // }
            // })
        }

        window.addEventListener('scroll', handleScroll)

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / (window.innerHeight * 3) // Correct aspect ratio for 3-section layout
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight * 3) // Maintain 3-section height
            
            // Update mobile optimization on resize
            const isMobile = window.innerWidth <= 768
            if (isMobile) {
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            } else {
                renderer.setPixelRatio(window.devicePixelRatio)
            }
        }
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleResize)
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement)
            }
            renderer.dispose()
        }
    }, [])

    return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: -1, pointerEvents: 'none' }} />
}

export default ThreeJsPlanets
