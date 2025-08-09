'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three-stdlib'
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'postprocessing'

const ScrollRocket = ({ containerRef }: { containerRef?: React.RefObject<HTMLDivElement> }) => {
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene>()
    const rendererRef = useRef<THREE.WebGLRenderer>()
    const rocketRef = useRef<THREE.Group>()
    const lastScrollY = useRef<number>(0)
    const flameRef = useRef<THREE.Group>()
    const composerRef = useRef<EffectComposer>()
    const bloomEffectRef = useRef<BloomEffect>()
    const [animationComplete, setAnimationComplete] = useState(false)
    const [finalPosition, setFinalPosition] = useState({ x: 0, y: 0, rotation: 0, scale: 1 })

    useEffect(() => {
        if (!mountRef.current) return

        // Scene setup
        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        camera.position.z = 10

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x000000, 0)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        rendererRef.current = renderer
        mountRef.current.appendChild(renderer.domElement)

        // Post-processing setup for glowing effects
        const composer = new EffectComposer(renderer)
        const renderPass = new RenderPass(scene, camera)
        
        // Bloom effect for fiery glow
        const bloomEffect = new BloomEffect({
            intensity: 1.5,
            luminanceThreshold: 0.1,
            luminanceSmoothing: 0.9
        })
        bloomEffectRef.current = bloomEffect
        
        const effectPass = new EffectPass(camera, bloomEffect)
        composer.addPass(renderPass)
        composer.addPass(effectPass)
        composerRef.current = composer

        // Add lighting for GLB model materials
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6) // Soft white light
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(10, 10, 5)
        scene.add(directionalLight)

        // Add a second light from the other side
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
        directionalLight2.position.set(-10, -10, -5)
        scene.add(directionalLight2)

        // Create procedural rocket
        const createProceduralRocket = () => {
            const rocketGroup = new THREE.Group()

            // Main body - short cylinder
            const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16)
            const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee })
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
            rocketGroup.add(body)

            // Nose - long pointy cone
            const noseGeometry = new THREE.ConeGeometry(0.08, 0.6, 16)
            const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 })
            const nose = new THREE.Mesh(noseGeometry, noseMaterial)
            nose.position.y = 0.5 // Position above body
            rocketGroup.add(nose)

            // Particle-based flame system at bottom of rocket
            const flameGroup = new THREE.Group()
            
            // Flame particle system configuration
            const FLAME_CONFIG = {
                particleCount: 80,
                emissionRate: 4, // particles per frame
                particleLifetime: 30, // frames
                baseVelocity: 0.02,
                velocityVariation: 0.012,
                size: 0.006,
                sizeVariation: 0.004,
                colors: [
                    new THREE.Color(1.0, 1.0, 0.95), // Bright white-yellow center
                    new THREE.Color(1.0, 0.9, 0.4),  // Bright yellow
                    new THREE.Color(1.0, 0.6, 0.2),  // Orange
                    new THREE.Color(0.9, 0.3, 0.1),  // Red-orange
                    new THREE.Color(0.6, 0.1, 0.05)  // Dark red
                ]
            }
            
            // Particle system arrays
            const particles: {
                position: THREE.Vector3
                velocity: THREE.Vector3
                life: number
                maxLife: number
                size: number
                color: THREE.Color
            }[] = []
            
            // Create particle geometry and material
            const particleGeometry = new THREE.BufferGeometry()
            const particlePositions = new Float32Array(FLAME_CONFIG.particleCount * 3)
            const particleColors = new Float32Array(FLAME_CONFIG.particleCount * 3)
            const particleSizes = new Float32Array(FLAME_CONFIG.particleCount)
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
            particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))
            particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1))
            
            // Particle shader material for realistic flame rendering
            const particleMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 }
                },
                vertexShader: `
                    attribute float size;
                    varying vec3 vColor;
                    varying float vAlpha;
                    
                    void main() {
                        vColor = color;
                        
                        // Calculate alpha based on particle life and position
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (400.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                        
                        // Fade particles as they move away from rocket
                        float distanceFade = 1.0 - smoothstep(-0.8, -0.2, position.y);
                        vAlpha = distanceFade * 0.9;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;
                    varying float vAlpha;
                    
                    void main() {
                        // Create circular particles with soft edges
                        float distance = length(gl_PointCoord - vec2(0.5, 0.5));
                        if (distance > 0.5) discard;
                        
                        float alpha = vAlpha * (1.0 - distance * 2.0);
                        alpha = smoothstep(0.0, 0.6, alpha);
                        
                        gl_FragColor = vec4(vColor, alpha);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                vertexColors: true,
                depthWrite: false
            })
            
            const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
            flameGroup.add(particleSystem)
            
            // Particle emission and update system
            const updateFlameParticles = (time: number) => {
                // Emit new particles from the BACK of the rocket (bottom)
                for (let i = 0; i < FLAME_CONFIG.emissionRate; i++) {
                    if (particles.length < FLAME_CONFIG.particleCount) {
                        // Create new particle at rocket exhaust (back/bottom of rocket)
                        const angle = Math.random() * Math.PI * 2
                        const radius = Math.random() * 0.025 // Even smaller radius at exhaust nozzle
                        
                        const particle = {
                            position: new THREE.Vector3(
                                Math.cos(angle) * radius,
                                -0.40 + Math.random() * 0.01, // Start at bottom of rocket body
                                Math.sin(angle) * radius
                            ),
                            velocity: new THREE.Vector3(
                                (Math.random() - 0.5) * FLAME_CONFIG.velocityVariation * 0.5, // Less sideways spread
                                -(FLAME_CONFIG.baseVelocity + Math.random() * FLAME_CONFIG.velocityVariation), // Downward (exhaust direction)
                                (Math.random() - 0.5) * FLAME_CONFIG.velocityVariation * 0.5
                            ),
                            life: 0,
                            maxLife: FLAME_CONFIG.particleLifetime + Math.random() * 15,
                            size: FLAME_CONFIG.size + Math.random() * FLAME_CONFIG.sizeVariation,
                            color: FLAME_CONFIG.colors[0].clone() // Start with hottest color
                        }
                        particles.push(particle)
                    }
                }
                
                // Update existing particles
                for (let i = particles.length - 1; i >= 0; i--) {
                    const particle = particles[i]
                    particle.life++
                    
                    if (particle.life >= particle.maxLife) {
                        particles.splice(i, 1)
                        continue
                    }
                    
                    // Update particle position
                    particle.position.add(particle.velocity)
                    
                    // Add realistic exhaust turbulence - more at the edges
                    const distanceFromCenter = Math.sqrt(particle.position.x*particle.position.x + particle.position.z*particle.position.z)
                    const turbulenceStrength = distanceFromCenter * 0.002
                    particle.velocity.x += (Math.random() - 0.5) * turbulenceStrength
                    particle.velocity.z += (Math.random() - 0.5) * turbulenceStrength
                    
                    // Flame expands as it moves away from rocket
                    particle.velocity.x *= 1.01 // Slight outward expansion
                    particle.velocity.z *= 1.01
                    particle.velocity.y *= 0.992 // Slow down over time
                    
                    // Realistic flame color progression (hot to cool)
                    const lifeRatio = particle.life / particle.maxLife
                    const colorIndex = Math.min(Math.floor(lifeRatio * FLAME_CONFIG.colors.length), FLAME_CONFIG.colors.length - 1)
                    const nextColorIndex = Math.min(colorIndex + 1, FLAME_CONFIG.colors.length - 1)
                    const localT = (lifeRatio * FLAME_CONFIG.colors.length) - colorIndex
                    
                    particle.color.lerpColors(FLAME_CONFIG.colors[colorIndex], FLAME_CONFIG.colors[nextColorIndex], localT)
                    
                    // Increase particle size as it ages (flame expansion)
                    particle.size += 0.00015
                }
                
                // Update buffer attributes
                const positions = particleGeometry.attributes.position.array as Float32Array
                const colors = particleGeometry.attributes.color.array as Float32Array
                const sizes = particleGeometry.attributes.size.array as Float32Array
                
                // Clear arrays
                positions.fill(0)
                colors.fill(0)
                sizes.fill(0)
                
                // Fill with active particles
                for (let i = 0; i < particles.length && i < FLAME_CONFIG.particleCount; i++) {
                    const particle = particles[i]
                    const i3 = i * 3
                    
                    positions[i3] = particle.position.x
                    positions[i3 + 1] = particle.position.y
                    positions[i3 + 2] = particle.position.z
                    
                    colors[i3] = particle.color.r
                    colors[i3 + 1] = particle.color.g
                    colors[i3 + 2] = particle.color.b
                    
                    sizes[i] = particle.size * 60 // Even smaller scale for visibility
                }
                
                // Mark attributes as needing update
                particleGeometry.attributes.position.needsUpdate = true
                particleGeometry.attributes.color.needsUpdate = true
                particleGeometry.attributes.size.needsUpdate = true
                
                // Update shader time uniform
                particleMaterial.uniforms.time.value = time * 0.001
            }
            
            flameGroup.position.y = 0
            rocketGroup.add(flameGroup)
            flameRef.current = flameGroup
            
            // Store the update function for use in animation loop
            ;(flameGroup as any).updateParticles = updateFlameParticles

            // Create three triangular fins
            const finGeometry = new THREE.BufferGeometry()
            const finVertices = new Float32Array([
                // Triangle vertices (pointing backward from rocket)
                -0.075, 0.2, 0,        // Base center (at rocket body)
                -0.3, -0.5, 0, // Bottom tip
                -0.075, -0.15, 0      // Top of fin
            ])
            finGeometry.setAttribute('position', new THREE.BufferAttribute(finVertices, 3))
            finGeometry.computeVertexNormals()
            
            const finMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff4444,
                side: THREE.DoubleSide 
            })

            // Add three fins at 120-degree intervals around the rocket
            for (let i = 0; i < 3; i++) {
                const fin = new THREE.Mesh(finGeometry, finMaterial)
                fin.position.y = -0.1 // Position at bottom of body
                fin.rotation.y = (i * 2 * Math.PI) / 3 // 120 degrees apart
                rocketGroup.add(fin)
            }

            rocketGroup.scale.set(2.0, 2.0, 2.0) // Much larger scale to be visible
            rocketGroup.position.set(8, 0, 0)
            scene.add(rocketGroup)
            rocketRef.current = rocketGroup
        }

        // Create the procedural rocket immediately
        createProceduralRocket()

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate)
            
            const currentTime = Date.now()
            const deltaTime = 1/60 // Assume 60fps for consistent physics
            
            // Update particle-based flame system
            if (flameRef.current && (flameRef.current as any).updateParticles) {
                (flameRef.current as any).updateParticles(currentTime)
            }
            
            // Use post-processing composer instead of direct renderer
            if (composerRef.current) {
                composerRef.current.render()
            } else {
                renderer.render(scene, camera)
            }
        }
        animate()

        // Handle scroll for rocket movement
        const handleScroll = () => {
            if (!containerRef?.current) return
            
            const rect = containerRef.current.getBoundingClientRect()
            const scrollY = Math.max(0, -rect.top) // How much starry background has scrolled past viewport top
            const maxScroll = containerRef.current.offsetHeight - window.innerHeight
            const scrollProgress = Math.min(scrollY / maxScroll, 1)
            
            // Check if scrolling down to create trail
            const isScrollingDown = scrollY > lastScrollY.current
            lastScrollY.current = scrollY
            
            // If animation is complete, use the stored final position
            if (animationComplete && rocketRef.current) {
                // Keep glow at minimum when animation is complete
                if (bloomEffectRef.current) {
                    bloomEffectRef.current.intensity = 0.1
                }
                
                rocketRef.current.position.set(finalPosition.x, finalPosition.y, 0)
                rocketRef.current.rotation.z = finalPosition.rotation
                rocketRef.current.scale.set(finalPosition.scale, finalPosition.scale, finalPosition.scale)
                rocketRef.current.visible = true
                return
            }
            
            if (rocketRef.current && scrollProgress > 0.5) { // Start after planets
                const rocketProgress = (scrollProgress - 0.5) * 2 // 0 to 1 for rocket phase
                const aspect = camera.aspect // width/height ratio
                const worldWidth = (aspect * 10)/1.35 // Approximate world width based on your camera distance
                // const worldHeight = 10 // Fixed height for simplicity

                // Rocket path: right -> left -> up-right
                let x: number, y: number, rotationZ: number, scale: number
                
                if (rocketProgress < 0.5) {
                    // Phase 1: Move from right to left and down
                    const phase1 = rocketProgress * 2
                    
                    // Ensure full glow intensity during phase 1
                    if (bloomEffectRef.current) {
                        bloomEffectRef.current.intensity = 1.5
                    }
                    
                    x = worldWidth - phase1 * (worldWidth * 2) // Similar to your current logic but responsive
                    y = -phase1 * 3 // 0 to -3
                    
                    // Start pointing left-down, gradually turn to point right-up towards the end
                    const startAngle = Math.atan2(2, 9) + Math.PI / 2 // Point left-down initially
                    const endAngle = Math.atan2(1, 0) + Math.PI / 2 // Point right-up at end
                    
                    // Gradual turn happens in the last 30% of phase 1
                    let turnProgress = 0
                    if (phase1 > 0.7) {
                        turnProgress = (phase1 - 0.7) / 0.3 // 0 to 1 in last 30%
                    }
                    
                    rotationZ = startAngle + (endAngle - startAngle) * turnProgress
                    scale = 0.5 + phase1 * 1.0 // Larger scale values for procedural rocket
                    console.log('Phase 1:', rocketProgress, phase1)
                } else {
                    // Phase 2: Move up and to the right
                    const phase2 = (rocketProgress - 0.5) * 2
                    x = -(worldWidth) + phase2 * ((worldWidth-4) * 2) // -8 to 8
                    y = -3 + (-2*phase2 +(phase2*1.5)**2) // -3 to 5
                    
                    // Fade out the glow effect during phase 2
                    if (bloomEffectRef.current) {
                        const fadeProgress = phase2 // 0 to 1 throughout phase 2
                        const initialIntensity = 1.5
                        const finalIntensity = 0.1 // Fade to very low intensity but not completely off
                        bloomEffectRef.current.intensity = initialIntensity - (fadeProgress * (initialIntensity - finalIntensity))
                    }
                    
                    const startAngle = Math.atan2(1, 0) + Math.PI / 2 // Point right-up at start
                    const midAngle = Math.atan2(2, -9) + Math.PI / 2 // Point left-down at mid
                    const endAngle = Math.atan2(-3, -8) + Math.PI / 2 // Point right-up at end (back to original)
                    
                    if (phase2 <= 0.2) {
                        // First 20%: transition from start angle to mid angle
                        const turnProgress = phase2 / 0.2 // 0 to 1 in first 20%
                        rotationZ = startAngle + (midAngle - startAngle) * turnProgress
                    } else {
                        // Remaining 80%: transition from mid angle to end angle (opposite direction)
                        const turnProgress = (phase2 - 0.2) / 0.8 // 0 to 1 in remaining 80%
                        // Force rotation in opposite direction by adding 2π to the angle difference
                        let angleDiff = endAngle - midAngle
                        if (angleDiff > 0) {
                            angleDiff -= 2 * Math.PI // Go the long way (clockwise instead of counter-clockwise)
                        } else {
                            angleDiff += 2 * Math.PI // Go the long way (counter-clockwise instead of clockwise)
                        }
                        rotationZ = midAngle + angleDiff * turnProgress

                    }

                    if (phase2 == 1) {
                        // Convert world coordinates to screen coordinates

                        const screenX = (x * 0.5 + 0.5) * renderer.domElement.clientWidth;
                        const screenY = -(y * 0.5 - 0.5) * renderer.domElement.clientHeight;

                        // Capture final position when animation completes
                        setFinalPosition({ x: screenX, y: screenY, rotation: rotationZ!, scale: scale! })
                        setAnimationComplete(true) // Mark animation as complete when reaching end
                    }
                    else {
                        setAnimationComplete(false) // Reset animation state if not at end
                    }
                    
                    
                    // rotationZ = Math.atan2(1, -2+3*y) + Math.PI / 2
                    // Already pointing right-up from end of phase 1
                    // rotationZ = Math.atan2(3, -8) + Math.PI / 2 // Point right-up
                    scale = 1.5 + phase2 * 1.0 // Larger scale values for procedural rocket
                    console.log('Phase 2:', rocketProgress, phase2)
                }
                
                rocketRef.current.position.set(x, y, 0)
                rocketRef.current.rotation.z = rotationZ
                rocketRef.current.scale.set(scale, scale, scale)
                
                // Show rocket
                rocketRef.current.visible = true
            } else if (rocketRef.current) {
                // Hide rocket before its phase and reset glow to full intensity
                if (bloomEffectRef.current) {
                    bloomEffectRef.current.intensity = 1.5
                }
                rocketRef.current.visible = false
            }
        }

        window.addEventListener('scroll', handleScroll)

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            
            // Update post-processing composer size
            if (composerRef.current) {
                composerRef.current.setSize(window.innerWidth, window.innerHeight)
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

    return <div ref={mountRef} style={{ 
        position: animationComplete ? 'relative' : 'fixed', 
        top: animationComplete? finalPosition.y + 100: 0, 
        left: 0, 
        zIndex: 5000, 
        pointerEvents: 'none',
        width: '100vw',
        minHeight: '100vh',
        overflow: 'visible'
    }} />
}

export default ScrollRocket
