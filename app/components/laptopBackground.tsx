"use client"

/*
 * LaptopBackground Component - Easy Configuration Guide
 * 
 * To adjust the 3D scene, modify the configuration constants below:
 * 
 * === CONTAINER SIZE (Requirement #5) ===
 * CONTAINER_WIDTH_SCALE: Controls the width scaling of the 3D viewport
 * CONTAINER_HEIGHT_SCALE: Controls the height scaling of the 3D viewport
 * - Values: 1.0 = normal size, 0.8 = 80% size, 1.2 = 120% size
 * - Uses CSS transform for perfect centering - NO layout shift or overflow
 * - Container always stays centered regardless of scale
 * 
 * === LAPTOP & OVERLAY SCALING (Requirement #6) ===
 * LAPTOP_SCALE: Scales the entire laptop model uniformly
 * SCREEN_OVERLAY_SCALE: Scales the screen content relative to laptop
 * - Values: 1.0 = normal size, 0.8 = smaller, 1.2 = larger
 * - Both scale together maintaining their relative positioning
 * 
 * === ADVANCED POSITIONING ===
 * LAPTOP_POSITION_OFFSET: Fine-tune laptop position {x, y, z}
 * CAMERA_DISTANCE_MULTIPLIER: Adjust viewing distance (1.0 = default)
 */

import React, { useRef, useState, useEffect, useCallback } from 'react'
import styles from './laptopBackground.module.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three-stdlib'

const FALLBACK_SCREEN = { width: 0.3, height: 0.2 }
const BEZEL_SCALE = 0.9
const AUTO_ROTATE_SPEED = 0
const FORCE_CONTAINER_SIZE = false

// === EASY CONFIGURATION OPTIONS ===
// 5. Container Size Configuration (adjusts 3D viewport with perfect centering)
const CONTAINER_WIDTH_SCALE = 2    // Adjust container width (1.0 = 100%, 0.8 = 80%, 1.2 = 120%)
const CONTAINER_HEIGHT_SCALE = 2   // Adjust container height (1.0 = 100%, 0.8 = 80%, 1.2 = 120%)

// 6. Laptop and Overlay Scaling Configuration (scales both together, maintaining relative position)
const LAPTOP_SCALE = 0.9            // Overall scale of laptop model (1.0 = default, 0.8 = smaller, 1.2 = larger)
const SCREEN_OVERLAY_SCALE = 1.0     // Scale of the screen overlay relative to laptop (1.0 = matches laptop scaling)

// 7. Canvas Resolution Configuration (adjusts webpage rendering quality)
const CANVAS_BASE_WIDTH = 1200      // Base canvas width - all elements scale from this (standard: 1200, high-res: 2400, ultra: 3600)
const CANVAS_BASE_HEIGHT = 800     // Base canvas height - all elements scale from this (standard: 800, high-res: 1600, ultra: 2400)
// Recommended presets:
// - Standard Quality:  1200x800  (1.0x scale factor)
// - High Quality:      2400x1600 (2.0x scale factor) 
// - Ultra Quality:     3600x2400 (3.0x scale factor)
// - Maximum Quality:   4800x3200 (4.0x scale factor)

// Advanced positioning fine-tuning (if needed)
const LAPTOP_POSITION_OFFSET = { x: 0, y: 0, z: 0 }  // Fine-tune laptop position
const CAMERA_DISTANCE_MULTIPLIER = 1.0                // Adjust camera distance (1.0 = default)
// === END CONFIGURATION ===

interface DetectedScreen {
    mesh: THREE.Mesh
    score: number
    size: THREE.Vector3
    center: THREE.Vector3
    thicknessAxis: number
}

const LaptopBackground = () => {
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene>()
    const rendererRef = useRef<THREE.WebGLRenderer>()
    const laptopRef = useRef<THREE.Group>()
    const cameraRef = useRef<THREE.PerspectiveCamera>()
    const isDraggingRef = useRef(false)
    const previousMousePositionRef = useRef({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Screen plane (textured) + anchor
    const screenPlaneRef = useRef<THREE.Mesh | null>(null)
    const screenAnchorRef = useRef<THREE.Object3D | null>(null)

    const initializedRef = useRef(false)

    // Detected screen dimensions (world units local plane size)
    const screenWidthRef = useRef<number>(FALLBACK_SCREEN.width)
    const screenHeightRef = useRef<number>(FALLBACK_SCREEN.height)

    // Math reuse
    const _quat = useRef(new THREE.Quaternion())
    const _normal = useRef(new THREE.Vector3())
    const _planePos = useRef(new THREE.Vector3())
    const _camPos = useRef(new THREE.Vector3())

    // Canvas / texture + UI state
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const textureRef = useRef<THREE.CanvasTexture | null>(null)
    const needsRedrawRef = useRef(true)
    const scrollOffsetRef = useRef(0)
    const insideScreenRef = useRef(false)
    const hoveredCardRef = useRef<string | null>(null)

    interface CardDef { 
        id: string; 
        title: string; 
        desc: string; 
        color: string; 
        link: string; 
        github?: string; 
        devpost?: string; 
        demo?: string; 
        image?: string; 
        gradient?: string;
        imageSize?: 'contain' | 'cover' | 'fill';
    }
    const cardsRef = useRef<CardDef[]>([
        { id: 'c1', title: 'Portfolio Website', desc: 'The project you are looking at right now!', color: '#4fc3f7', link: '/projects', github: 'https://github.com/IlyaasAitSimmou/Ilyaas-website', gradient: 'linear-gradient(135deg, #ffd43b, #f39c12)' },
        { id: 'c2', title: 'Rocket Simulation', desc: '3D simulator to replay model rocket flights based on sensor data.', color: '#ff6b6b', link: '/projects', image: '/logos/rocketsim2.png', github: 'https://github.com/IlyaasAitSimmou/rocket_flight_sim' },
        { id: 'c3', title: 'SpendWise', desc: 'A web application that tracks and evaluates user spending habits by scanning receipts and provides alternatives based on location.', link: '/projects', image: '/logos/spendwise.png', github: 'https://github.com/aarnavshah12/SpendWise', devpost: 'https://devpost.com/software/spendwise-4hqxyk', demo: 'https://spend-wise-liart.vercel.app/', imageSize: 'contain', color: 'white' },
        { id: 'c4', title: 'SIMAD Foundation', desc: 'The official website of SIMAD, an organization focused on providing students with competition-based learning experiences.', color: '#ffd43b', link: '/projects', github: 'https://github.com/IlyaasAitSimmou/simad_website', demo: 'https://simadfoundation.com/', image: '/logos/simad.png' },
        { id: 'c5', title: 'Flappy Fitness', desc: 'An exercise-controlled variant of Flappy Bird built with Pygame and OpenCV', color: '#ff9f43', link: '/projects', image: '/logos/flappyfitness.png', github: 'https://github.com/aarnavshah12/Flappy-Fitness', devpost: 'https://devpost.com/software/flappy-fitness-jzghs7'},
        { id: 'c6', title: 'Numina', desc: 'A web application that instantly turns any topic into a narrated math animation with a live AI agent for personalized tutoring.', color: '#06101e', link: '/projects', image: '/logos/numina.png', github: 'https://github.com/NimayDesai/Numina', devpost: 'https://devpost.com/software/numina-a9vyu4', imageSize: 'contain' },
        { id: 'c7', title: 'Classcade', desc: 'A Google Classroom like platform where learning is gamified and player stats improve with student diligence.', color: '#ff6f61', link: '/projects', gradient: 'linear-gradient(135deg, #ff9f43, #ff7675)', devpost: 'https://devpost.com/software/classcade', github: 'https://github.com/IlyaasAitSimmou/ClassCade' },
        { id: 'c8', title: 'upNotes.ai', desc: 'A full-stack LLM based application that helps students take better notes, practice concepts, and improve their grades', color: 'black', gradient: 'linear-gradient(55deg,rgba(0, 0, 0, 1) 0%, rgba(61, 61, 61, 1) 100%)', link: '/projects', image: '/logos/upnotesai.png', github: 'https://github.com/JinayD1/upNotes.ai', devpost: 'https://devpost.com/software/placeholder-u0mvno', imageSize: 'contain'},
        { id: 'c9', title: 'TeenToolkit', desc: 'An AI-powered web application containing various tools to assist teenagers in financial, education, and social aspects of their daily lives.', color: '#1e90ff', link: '/projects', github: 'https://github.com/IlyaasAitSimmou/recess_hacks_project', devpost: 'https://devpost.com/software/teentoolkit?ref_content=user-portfolio&ref_feature=in_progress', image: '/logos/teentoolkit.webp' },
        { id: 'c10', title: 'SpeechDoc', desc: 'A basic machine learning project including a streamlit app where two models are used to predict the gender of a speaker featured in an audio and whether or not their voice is impaired.', color: '#abcdef', link: '/projects', github: 'https://github.com/IlyaasAitSimmou/SpeechDoc', demo: 'https://speechdoc.streamlit.app/', imageSize: 'contain' }
        //gradient: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
    ])
    type HitRegion = { 
        id: string; 
        x: number; 
        y: number; 
        w: number; 
        h: number; 
        link: string; 
        type?: 'card' | 'github' | 'devpost' | 'demo' 
    }
    const hitRegionsRef = useRef<HitRegion[]>([])
    
    // Icon images cache
    const iconsRef = useRef<{ [key: string]: HTMLImageElement }>({})
    const iconsLoadedRef = useRef(false)
    
    // Card images cache
    const cardImagesRef = useRef<{ [key: string]: HTMLImageElement }>({})
    const cardImagesLoadedRef = useRef(false)

    const buildCanvas = () => {
        const c = document.createElement('canvas')
        c.width = CANVAS_BASE_WIDTH
        c.height = CANVAS_BASE_HEIGHT
        const ctx = c.getContext('2d')!
        canvasRef.current = c
        ctxRef.current = ctx
        const tex = new THREE.CanvasTexture(c)
        if (THREE.SRGBColorSpace && tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        textureRef.current = tex
        needsRedrawRef.current = true
    }

    // Calculate scale factor based on canvas resolution (1200x800 = 1.0x scale)
    const getScaleFactor = () => CANVAS_BASE_WIDTH / 1200

    // Helper function to scale any value proportionally to resolution
    const scale = (value: number) => value * getScaleFactor()

    const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
    }

    const parseLinearGradient = (gradientString: string) => {
        // Handle linear-gradient with potentially complex color values (like rgba)
        const match = gradientString.match(/linear-gradient\s*\(\s*(.+)\s*\)/)
        if (!match) return null
        
        const content = match[1]
        const parts: string[] = []
        let currentPart = ''
        let parenDepth = 0
        
        // Parse character by character to handle nested parentheses in rgba() colors
        for (let i = 0; i < content.length; i++) {
            const char = content[i]
            
            if (char === '(') {
                parenDepth++
                currentPart += char
            } else if (char === ')') {
                parenDepth--
                currentPart += char
            } else if (char === ',' && parenDepth === 0) {
                // Only split on commas that are not inside parentheses
                parts.push(currentPart.trim())
                currentPart = ''
            } else {
                currentPart += char
            }
        }
        
        // Add the last part
        if (currentPart.trim()) {
            parts.push(currentPart.trim())
        }
        
        // Should have at least direction and 2 colors
        if (parts.length < 3) return null
        
        // Clean up color values by removing percentage values and extra whitespace
        const cleanColor = (colorPart: string) => {
            return colorPart.replace(/\s+\d+%/g, '').trim()
        }
        
        return {
            direction: parts[0].trim(),
            color1: cleanColor(parts[1]),
            color2: cleanColor(parts[2])
        }
    }

    const loadIcons = () => {
        if (iconsLoadedRef.current) return
        
        const iconPaths = {
            github: '/logos/githubicon.png',
            devpost: '/logos/devpost.png'
        }
        
        let loadedCount = 0
        const totalIcons = Object.keys(iconPaths).length
        
        Object.entries(iconPaths).forEach(([key, path]) => {
            const img = new Image()
            img.onload = () => {
                iconsRef.current[key] = img
                loadedCount++
                if (loadedCount === totalIcons) {
                    iconsLoadedRef.current = true
                    needsRedrawRef.current = true
                }
            }
            img.onerror = () => {
                console.warn(`Failed to load icon: ${path}`)
                loadedCount++
                if (loadedCount === totalIcons) {
                    iconsLoadedRef.current = true
                    needsRedrawRef.current = true
                }
            }
            img.src = path
        })
    }

    const loadCardImages = () => {
        if (cardImagesLoadedRef.current) return
        
        // Collect unique image paths from cards
        const imagePaths: { [key: string]: string } = {}
        cardsRef.current.forEach(card => {
            if (card.image && !imagePaths[card.image]) {
                imagePaths[card.image] = card.image
            }
        })
        
        const totalImages = Object.keys(imagePaths).length
        if (totalImages === 0) {
            cardImagesLoadedRef.current = true
            return
        }
        
        let loadedCount = 0
        
        Object.entries(imagePaths).forEach(([path, src]) => {
            const img = new Image()
            img.onload = () => {
                cardImagesRef.current[path] = img
                loadedCount++
                if (loadedCount === totalImages) {
                    cardImagesLoadedRef.current = true
                    needsRedrawRef.current = true
                }
            }
            img.onerror = () => {
                console.warn(`Failed to load card image: ${src}`)
                loadedCount++
                if (loadedCount === totalImages) {
                    cardImagesLoadedRef.current = true
                    needsRedrawRef.current = true
                }
            }
            img.src = src
        })
    }

    const drawUI = () => {
        if (!ctxRef.current || !canvasRef.current) return
        const ctx = ctxRef.current
        const canvas = canvasRef.current
        if (!needsRedrawRef.current) return
        needsRedrawRef.current = false

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Background
        const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        grd.addColorStop(0, '#1a1a2e')
        grd.addColorStop(1, '#16213e')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Header
        ctx.fillStyle = 'rgba(0,0,0,0.65)'
        ctx.fillRect(0, 0, canvas.width, scale(110)) // Auto-scale header height
        ctx.strokeStyle = '#4fc3f7'
        ctx.lineWidth = scale(2) // Auto-scale line width
        ctx.beginPath(); ctx.moveTo(0, scale(110)); ctx.lineTo(canvas.width, scale(110)); ctx.stroke()
        ctx.fillStyle = '#4fc3f7'
        ctx.font = `600 ${scale(42)}px Arial` // Auto-scale font
        ctx.textAlign = 'center'
        ctx.fillText('My Projects', canvas.width / 2, scale(60)) // Auto-scale position
        ctx.fillStyle = '#ccc'
        ctx.font = `400 ${scale(20)}px Arial` // Auto-scale font
        ctx.fillText('Click the links on the right to check projects out!', canvas.width / 2, scale(95)) // Auto-scale position

        // Cards area
        const paddingX = scale(60) // Auto-scale padding
        const startY = scale(140)  // Auto-scale start position
        const gap = scale(26)      // Auto-scale gap
        const cardH = scale(140)   // Auto-scale card height
        hitRegionsRef.current = []
        const contentTotalHeight = cardsRef.current.length * (cardH + gap) - gap
        const maxScroll = Math.max(0, contentTotalHeight - (canvas.height - startY - scale(40))) // Auto-scale bottom margin
        if (scrollOffsetRef.current > maxScroll) scrollOffsetRef.current = maxScroll
        if (scrollOffsetRef.current < 0) scrollOffsetRef.current = 0

        // Create clipping region to prevent cards from drawing over header
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, scale(110), canvas.width, canvas.height - scale(110)) // Auto-scale clip region
        ctx.clip()

        cardsRef.current.forEach((card, i) => {
            const y = startY + i * (cardH + gap) - scrollOffsetRef.current
            if (y + cardH < startY - scale(50) || y > canvas.height) return // Auto-scale cull margin
            
            // Additional check: don't render if card would appear above the header
            if (y < scale(110)) return // Auto-scale header height
            
            ctx.save()
            // Card background
            ctx.fillStyle = 'rgba(255,255,255,0.08)'
            ctx.strokeStyle = 'rgba(255,255,255,0.25)'
            ctx.lineWidth = scale(2) // Auto-scale line width
            const r = scale(18) // Auto-scale border radius
            const x = paddingX
            const w = canvas.width - paddingX * 2
            // Rounded rect
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.lineTo(x + w - r, y)
            ctx.quadraticCurveTo(x + w, y, x + w, y + r)
            ctx.lineTo(x + w, y + cardH - r)
            ctx.quadraticCurveTo(x + w, y + cardH, x + w - r, y + cardH)
            ctx.lineTo(x + r, y + cardH)
            ctx.quadraticCurveTo(x, y + cardH, x, y + cardH - r)
            ctx.lineTo(x, y + r)
            ctx.quadraticCurveTo(x, y, x + r, y)
            ctx.closePath()
            ctx.fill(); ctx.stroke()

            // Image/Gradient section (left side of card) - more square
            const imageSize = scale(110) // Auto-scale image size
            const imageX = x + scale(10)  // Auto-scale position
            const imageY = y + scale(15)  // Auto-scale position
            
            ctx.save()
            // Create rounded clipping path for image area
            const imageRadius = scale(12) // Auto-scale radius
            ctx.beginPath()
            ctx.moveTo(imageX + imageRadius, imageY)
            ctx.lineTo(imageX + imageSize - imageRadius, imageY)
            ctx.quadraticCurveTo(imageX + imageSize, imageY, imageX + imageSize, imageY + imageRadius)
            ctx.lineTo(imageX + imageSize, imageY + imageSize - imageRadius)
            ctx.quadraticCurveTo(imageX + imageSize, imageY + imageSize, imageX + imageSize - imageRadius, imageY + imageSize)
            ctx.lineTo(imageX + imageRadius, imageY + imageSize)
            ctx.quadraticCurveTo(imageX, imageY + imageSize, imageX, imageY + imageSize - imageRadius)
            ctx.lineTo(imageX, imageY + imageRadius)
            ctx.quadraticCurveTo(imageX, imageY, imageX + imageRadius, imageY)
            ctx.closePath()
            ctx.clip()
            
            if (card.image && cardImagesRef.current[card.image]) {
                // First draw background (color or gradient)
                if (card.gradient) {
                    const gradientData = parseLinearGradient(card.gradient)
                    if (gradientData) {
                        let gradient
                        if (gradientData.direction.includes('135deg') || gradientData.direction.includes('45deg')) {
                            gradient = ctx.createLinearGradient(imageX, imageY, imageX + imageSize, imageY + imageSize)
                        } else if (gradientData.direction.includes('55deg')) {
                            // Handle 55deg as a diagonal
                            gradient = ctx.createLinearGradient(imageX, imageY + imageSize * 0.3, imageX + imageSize, imageY + imageSize * 0.7)
                        } else {
                            gradient = ctx.createLinearGradient(imageX, imageY, imageX + imageSize, imageY)
                        }
                        gradient.addColorStop(0, gradientData.color1)
                        gradient.addColorStop(1, gradientData.color2)
                        ctx.fillStyle = gradient
                        ctx.fillRect(imageX, imageY, imageSize, imageSize)
                    } else {
                        ctx.fillStyle = card.color
                        ctx.fillRect(imageX, imageY, imageSize, imageSize)
                    }
                } else {
                    ctx.fillStyle = card.color
                    ctx.fillRect(imageX, imageY, imageSize, imageSize)
                }
                
                // Then draw image with specified sizing
                const img = cardImagesRef.current[card.image]
                const imgAspect = img.width / img.height
                const targetAspect = 1 // Square target
                const imageMode = card.imageSize || 'cover' // Default to cover
                
                let drawWidth, drawHeight, drawX, drawY
                
                if (imageMode === 'fill') {
                    // Stretch to fill entire square
                    drawWidth = imageSize
                    drawHeight = imageSize
                    drawX = imageX
                    drawY = imageY
                } else if (imageMode === 'contain') {
                    // Fit entire image within square, maintaining aspect ratio
                    if (imgAspect > targetAspect) {
                        // Image is wider - fit by width
                        drawWidth = imageSize
                        drawHeight = drawWidth / imgAspect
                        drawX = imageX
                        drawY = imageY + (imageSize - drawHeight) / 2
                    } else {
                        // Image is taller or square - fit by height
                        drawHeight = imageSize
                        drawWidth = drawHeight * imgAspect
                        drawX = imageX + (imageSize - drawWidth) / 2
                        drawY = imageY
                    }
                } else { // 'cover' - default behavior
                    // Cover entire square, cropping if necessary
                    if (imgAspect > targetAspect) {
                        // Image is wider than target - crop horizontally
                        drawHeight = imageSize
                        drawWidth = drawHeight * imgAspect
                        drawX = imageX - (drawWidth - imageSize) / 2
                        drawY = imageY
                    } else {
                        // Image is taller than target - crop vertically
                        drawWidth = imageSize
                        drawHeight = drawWidth / imgAspect
                        drawX = imageX
                        drawY = imageY - (drawHeight - imageSize) / 2
                    }
                }
                
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
            } else if (card.gradient) {
                // Parse and draw gradient
                const gradientMatch = card.gradient.match(/linear-gradient\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
                if (gradientMatch) {
                    const [, direction, color1, color2] = gradientMatch
                    let gradient
                    if (direction.includes('135deg')) {
                        gradient = ctx.createLinearGradient(imageX, imageY, imageX + imageSize, imageY + imageSize)
                    } else {
                        gradient = ctx.createLinearGradient(imageX, imageY, imageX + imageSize, imageY)
                    }
                    gradient.addColorStop(0, color1.trim())
                    gradient.addColorStop(1, color2.trim())
                    ctx.fillStyle = gradient
                    ctx.fillRect(imageX, imageY, imageSize, imageSize)
                } else {
                    // Fallback to solid color if gradient parsing fails
                    ctx.fillStyle = card.color
                    ctx.fillRect(imageX, imageY, imageSize, imageSize)
                }
            } else {
                // Fallback to solid color
                ctx.fillStyle = card.color
                ctx.fillRect(imageX, imageY, imageSize, imageSize)
            }
            ctx.restore()

            // Text (moved to account for image space)
            const textStartX = imageX + imageSize + scale(15) // Auto-scale gap
            ctx.fillStyle = '#4fc3f7'
            ctx.font = `600 ${scale(28)}px Arial` // Auto-scale font
            ctx.textAlign = 'left'
            ctx.fillText(card.title, textStartX, y + scale(42)) // Auto-scale position
            ctx.fillStyle = '#ccc'
            ctx.font = `400 ${scale(18)}px Arial` // Auto-scale font
            wrapText(ctx, card.desc, textStartX, y + scale(72), canvas.width - paddingX * 2 - scale(200) - imageSize, scale(24)) // Auto-scale all dimensions
            
            // Icon buttons section - improved positioning
            const iconSize = scale(36) // Auto-scale icon size
            const iconGap = scale(12)  // Auto-scale gap
            const edgePadding = scale(8) // Auto-scale padding
            
            // Calculate available space and center icons horizontally
            const availableIcons = [
                card.github ? 'github' : null,
                card.devpost ? 'devpost' : null,
                card.demo ? 'demo' : null
            ].filter(Boolean)
            
            const totalIconsWidth = availableIcons.length * iconSize + (availableIcons.length - 1) * iconGap
            const iconStartX = x + w - totalIconsWidth - edgePadding
            const iconY = y + edgePadding // Position at top right instead of bottom
            let currentIconX = iconStartX
            
            // GitHub icon
            if (card.github) {
                const isHovered = hoveredCardRef.current === card.id + '_github'
                const iconBg = isHovered ? 'rgba(79,195,247,0.25)' : 'rgba(79,195,247,0.08)'
                const iconBorder = isHovered ? 'rgba(79,195,247,0.9)' : 'rgba(79,195,247,0.4)'
                
                // Draw icon background with subtle shadow
                ctx.save()
                ctx.shadowColor = 'rgba(0,0,0,0.2)'
                ctx.shadowBlur = isHovered ? 8 : 4
                ctx.shadowOffsetY = 2
                ctx.fillStyle = iconBg
                ctx.strokeStyle = iconBorder
                ctx.lineWidth = isHovered ? scale(2) : scale(1) // Auto-scale line width
                drawRoundedRect(ctx, currentIconX, iconY, iconSize, iconSize, scale(8)) // Auto-scale corner radius
                ctx.fill()
                ctx.stroke()
                ctx.restore()
                
                // Draw GitHub icon
                if (iconsRef.current.github) {
                    const imgPadding = isHovered ? scale(4) : scale(6) // Auto-scale padding
                    ctx.drawImage(iconsRef.current.github, currentIconX + imgPadding, iconY + imgPadding, iconSize - imgPadding*2, iconSize - imgPadding*2)
                } else {
                    // Fallback text
                    ctx.fillStyle = '#4fc3f7'
                    ctx.font = `600 ${scale(12)}px Arial` // Auto-scale font
                    ctx.textAlign = 'center'
                    ctx.fillText('GH', currentIconX + iconSize/2, iconY + iconSize/2 + scale(4)) // Auto-scale offset
                }
                
                hitRegionsRef.current.push({ 
                    id: card.id + '_github', 
                    x: currentIconX, 
                    y: iconY, 
                    w: iconSize, 
                    h: iconSize, 
                    link: card.github,
                    type: 'github'
                })
                currentIconX += iconSize + iconGap
            }
            
            // Devpost icon
            if (card.devpost) {
                const isHovered = hoveredCardRef.current === card.id + '_devpost'
                const iconBg = isHovered ? 'rgba(79,195,247,0.3)' : 'rgba(79,195,247,0.1)'
                const iconBorder = isHovered ? 'rgba(79,195,247,0.8)' : 'rgba(79,195,247,0.3)'
                
                // Draw icon background
                ctx.fillStyle = iconBg
                ctx.strokeStyle = iconBorder
                ctx.lineWidth = isHovered ? scale(2) : scale(1) // Auto-scale line width
                drawRoundedRect(ctx, currentIconX, iconY, iconSize, iconSize, scale(6)) // Auto-scale corner radius
                ctx.fill()
                ctx.stroke()
                
                // Draw Devpost icon
                if (iconsRef.current.devpost) {
                    const iconPadding = isHovered ? scale(2) : scale(4) // Auto-scale padding
                    ctx.drawImage(iconsRef.current.devpost, currentIconX + iconPadding, iconY + iconPadding, iconSize - iconPadding*2, iconSize - iconPadding*2)
                } else {
                    // Fallback text
                    ctx.fillStyle = '#4fc3f7'
                    ctx.font = `600 ${scale(14)}px Arial` // Auto-scale font
                    ctx.textAlign = 'center'
                    ctx.fillText('DP', currentIconX + iconSize/2, iconY + iconSize/2 + scale(5)) // Auto-scale offset
                }
                
                hitRegionsRef.current.push({ 
                    id: card.id + '_devpost', 
                    x: currentIconX, 
                    y: iconY, 
                    w: iconSize, 
                    h: iconSize, 
                    link: card.devpost,
                    type: 'devpost'
                })
                currentIconX += iconSize + iconGap
            }
            
            // Demo icon (play button)
            if (card.demo) {
                const isHovered = hoveredCardRef.current === card.id + '_demo'
                const iconBg = isHovered ? 'rgba(79,195,247,0.3)' : 'rgba(79,195,247,0.1)'
                const iconBorder = isHovered ? 'rgba(79,195,247,0.8)' : 'rgba(79,195,247,0.3)'
                
                // Draw icon background
                ctx.fillStyle = iconBg
                ctx.strokeStyle = iconBorder
                ctx.lineWidth = isHovered ? scale(2) : scale(1) // Auto-scale line width
                drawRoundedRect(ctx, currentIconX, iconY, iconSize, iconSize, scale(6)) // Auto-scale corner radius
                ctx.fill()
                ctx.stroke()
                
                // Draw play button triangle
                ctx.fillStyle = isHovered ? '#ffffff' : '#4fc3f7'
                ctx.beginPath()
                const centerX = currentIconX + iconSize/2
                const centerY = iconY + iconSize/2
                const triangleSize = isHovered ? scale(12) : scale(10) // Auto-scale triangle
                ctx.moveTo(centerX - triangleSize/2, centerY - triangleSize)
                ctx.lineTo(centerX + triangleSize, centerY)
                ctx.lineTo(centerX - triangleSize/2, centerY + triangleSize)
                ctx.closePath()
                ctx.fill()
                
                hitRegionsRef.current.push({ 
                    id: card.id + '_demo', 
                    x: currentIconX, 
                    y: iconY, 
                    w: iconSize, 
                    h: iconSize, 
                    link: card.demo,
                    type: 'demo'
                })
                currentIconX += iconSize + iconGap
            }
            
            // Removed "Click to view →" text since cards are no longer clickable
            // Hover highlight
            if (hoveredCardRef.current === card.id) {
                ctx.save()
                ctx.strokeStyle = '#ffffff'
                ctx.lineWidth = 3
                ctx.globalAlpha = 0.6
                ctx.beginPath()
                ctx.moveTo(x + r, y)
                ctx.lineTo(x + w - r, y)
                ctx.quadraticCurveTo(x + w, y, x + w, y + r)
                ctx.lineTo(x + w, y + cardH - r)
                ctx.quadraticCurveTo(x + w, y + cardH, x + w - r, y + cardH)
                ctx.lineTo(x + r, y + cardH)
                ctx.quadraticCurveTo(x, y + cardH, x, y + cardH - r)
                ctx.lineTo(x, y + r)
                ctx.quadraticCurveTo(x, y, x + r, y)
                ctx.closePath()
                ctx.stroke()
                ctx.restore()
            }
            
            // Add main card hit region (but exclude the icon area on the right)
            hitRegionsRef.current.push({ 
                id: card.id, 
                x, 
                y, 
                w: w - 160, // Exclude the right side where icons are
                h: cardH, 
                link: card.link,
                type: 'card'
            })
            ctx.restore()
        })

        // Restore context (remove clipping)
        ctx.restore()

        // Scroll bar (simple)
        if (contentTotalHeight > (canvas.height - startY - 40)) {
            const trackX = canvas.width - 24
            const trackY = Math.max(startY, 110) // Don't let scrollbar start above header
            const trackH = canvas.height - trackY - 40
            ctx.fillStyle = 'rgba(255,255,255,0.08)'
            ctx.fillRect(trackX, trackY, 8, trackH)
            const ratio = trackH / contentTotalHeight
            const thumbH = Math.max(40, trackH * ratio)
            const scrollRatio = scrollOffsetRef.current / maxScroll
            const thumbY = trackY + (trackH - thumbH) * scrollRatio
            ctx.fillStyle = '#4fc3f7'
            ctx.fillRect(trackX, thumbY, 8, thumbH)
        }

        textureRef.current!.needsUpdate = true
    }

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ')
        let line = ''
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' '
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line.trim(), x, y)
                line = words[n] + ' '
                y += lineHeight
            } else {
                line = testLine
            }
        }
        ctx.fillText(line.trim(), x, y)
    }

    const updateVisibility = useCallback(() => {
        if (!cameraRef.current || !screenAnchorRef.current || !screenPlaneRef.current) return
        const camera = cameraRef.current
        const anchor = screenAnchorRef.current
        anchor.getWorldQuaternion(_quat.current)
        anchor.getWorldPosition(_planePos.current)
        camera.getWorldPosition(_camPos.current)
        _normal.current.set(0,0,1).applyQuaternion(_quat.current)
        const facing = _normal.current.dot(_camPos.current.clone().sub(_planePos.current).normalize()) > 0
        screenPlaneRef.current.visible = facing
    }, [])

    const getCanvasCoords = (clientX: number, clientY: number) => {
        if (!rendererRef.current || !cameraRef.current || !screenPlaneRef.current || !screenAnchorRef.current || !canvasRef.current) return null
        const rect = rendererRef.current.domElement.getBoundingClientRect()
        const xN = ((clientX - rect.left) / rect.width) * 2 - 1
        const yN = -((clientY - rect.top) / rect.height) * 2 + 1
        const ray = new THREE.Raycaster()
        ray.setFromCamera(new THREE.Vector2(xN, yN), cameraRef.current)
        const ints = ray.intersectObject(screenPlaneRef.current, false)
        if (!ints.length) return null
        const pt = ints[0].point.clone()
        // Transform point into anchor local space (plane centered)
        const anchorWorldMatrix = screenAnchorRef.current.matrixWorld.clone()
        const inv = new THREE.Matrix4().copy(anchorWorldMatrix).invert()
        pt.applyMatrix4(inv)
        // Plane geometry is centered; local x,y correspond directly
        const localX = pt.x
        const localY = pt.y
        const u = (localX / (screenWidthRef.current)) + 0.5
        const v = 0.5 - (localY / (screenHeightRef.current))
        if (u < 0 || u > 1 || v < 0 || v > 1) return null
        return { x: u * canvasRef.current.width, y: v * canvasRef.current.height }
    }

    // Modify handleClick to trigger fullscreen when clicking empty screen area
    const handleClick = (e: MouseEvent) => {
        const coords = getCanvasCoords(e.clientX, e.clientY)
        if (!coords) return
        let clickedSomething = false
        
        // Check for any clickable element (only icon buttons are clickable now)
        for (const r of hitRegionsRef.current) {
            if (coords.x >= r.x && coords.x <= r.x + r.w && coords.y >= r.y && coords.y <= r.y + r.h) {
                if (r.type === 'github' || r.type === 'devpost' || r.type === 'demo') {
                    // Open external links in new tab
                    console.log(`Clicking ${r.type} button, opening: ${r.link}`)
                    window.open(r.link, '_blank')
                    clickedSomething = true
                    break
                }
                // Remove card navigation - cards are no longer clickable
                // Just mark that something was clicked to prevent fullscreen opening
                if (r.type === 'card') {
                    clickedSomething = true
                    break
                }
            }
        }
        
        // If nothing was clicked, open fullscreen
        if (!clickedSomething) {
            setIsFullscreen(true)
        }
    }

    const handleWheel = (e: WheelEvent) => {
        const coords = getCanvasCoords(e.clientX, e.clientY)
        if (!coords) return
        e.preventDefault()
        scrollOffsetRef.current += e.deltaY * 0.6
        needsRedrawRef.current = true
    }

    const handlePointerMove = (e: MouseEvent) => {
        const coords = getCanvasCoords(e.clientX, e.clientY)
        insideScreenRef.current = !!coords
        if (mountRef.current) {
            mountRef.current.style.cursor = insideScreenRef.current ? 'pointer' : (isDraggingRef.current ? 'grabbing' : 'grab')
        }
        let newHover: string | null = null
        if (coords) {
            // Check hit regions in order of priority: icon buttons first, then cards
            for (const r of hitRegionsRef.current) {
                if (coords.x >= r.x && coords.x <= r.x + r.w && coords.y >= r.y && coords.y <= r.y + r.h) { 
                    newHover = r.id
                    break 
                }
            }
        }
        if (newHover !== hoveredCardRef.current) { 
            hoveredCardRef.current = newHover
            needsRedrawRef.current = true 
        }
    }

    const handlePointerLeave = () => {
        insideScreenRef.current = false
        hoveredCardRef.current = null
        needsRedrawRef.current = true
        if (mountRef.current) mountRef.current.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab'
    }

    // Detect screen surface from GLTF (heuristic)
    const detectScreen = (root: THREE.Object3D): DetectedScreen | null => {
        let best: DetectedScreen & { center: THREE.Vector3; score: number } | null = null
        root.traverse(obj => {
            if ((obj as any).isMesh) {
                const mesh = obj as THREE.Mesh
                const geom = mesh.geometry as THREE.BufferGeometry
                if (!geom.attributes.position) return
                if (!geom.boundingBox) geom.computeBoundingBox()
                const bb = geom.boundingBox!
                const size = new THREE.Vector3(); bb.getSize(size)
                const maxDim = Math.max(size.x, size.y, size.z)
                if (maxDim < 0.1) return
                const dims = [size.x, size.y, size.z]
                const thickness = Math.min(...dims)
                if (thickness > maxDim * 0.12) return
                const thicknessAxis = dims.indexOf(thickness)
                const area = dims.reduce((acc,v,i)=> i===thicknessAxis? acc: acc*v,1)
                const nonAxes = [0,1,2].filter(i=>i!==thicknessAxis)
                const aspect = dims[nonAxes[0]] / dims[nonAxes[1]]
                if (aspect < 1.3 || aspect > 1.7) return
                const score = area - thickness * 2
                if (!best || score > best.score) {
                    const center = new THREE.Vector3(); bb.getCenter(center)
                    best = { mesh, score, size, center, thicknessAxis }
                }
            }
        })
        return best
    }

    // Helper to set renderer & camera aspect from container (optional)
    const resizeFromContainer = useCallback(() => {
        if (!mountRef.current || !cameraRef.current || !rendererRef.current) return
        
        // For transform-based scaling, we keep the base dimensions and let CSS handle visual scaling
        const baseW = FORCE_CONTAINER_SIZE ? mountRef.current.clientWidth : window.innerWidth
        const baseH = FORCE_CONTAINER_SIZE ? mountRef.current.clientHeight : window.innerHeight
        
        // The renderer uses base dimensions - CSS transform handles the visual scaling
        cameraRef.current.aspect = baseW / baseH
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(baseW, baseH)
    }, [])

    useEffect(() => {
        if (initializedRef.current) return
        initializedRef.current = true
        if (!mountRef.current) return

        const scene = new THREE.Scene()
        sceneRef.current = scene

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 100)
        camera.position.set(0, 0, 6 * CAMERA_DISTANCE_MULTIPLIER) // Apply camera distance scaling
        cameraRef.current = camera

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(window.devicePixelRatio)
        rendererRef.current = renderer
        mountRef.current.innerHTML = ''
        mountRef.current.appendChild(renderer.domElement)
        resizeFromContainer() // initial sizing

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.6))
        const dir1 = new THREE.DirectionalLight(0xffffff, 0.8); dir1.position.set(5,5,5); scene.add(dir1)
        const dir2 = new THREE.DirectionalLight(0xffffff, 0.4); dir2.position.set(-5,-5,-5); scene.add(dir2)

        // Prepare canvas + texture
        buildCanvas()
        
        // Load icon images and card images
        loadIcons()
        loadCardImages()

        const loader = new GLTFLoader()
        loader.load('/models/apple_macbook_air_13_space_gray_2023.glb', (gltf) => {
            const laptop = gltf.scene
            // Apply laptop scaling configuration
            const baseScale = 10 * LAPTOP_SCALE
            laptop.scale.set(baseScale, baseScale, baseScale)
            laptop.position.set(
                LAPTOP_POSITION_OFFSET.x, 
                LAPTOP_POSITION_OFFSET.y, 
                LAPTOP_POSITION_OFFSET.z
            )
            laptop.traverse((child) => { if ((child as any).isMesh) { (child as THREE.Mesh).castShadow = true; (child as THREE.Mesh).receiveShadow = true } })
            scene.add(laptop)
            laptopRef.current = laptop

            const detected = detectScreen(laptop)
            if (detected) {
                const d = detected
                d.mesh.updateWorldMatrix(true, true)
                const geom = d.mesh.geometry as THREE.BufferGeometry
                if (!geom.boundingBox) geom.computeBoundingBox()
                const bb = geom.boundingBox!
                const min = bb.min, max = bb.max
                const thicknessAxis = d.thicknessAxis
                const planeAxes = [0,1,2].filter(i=>i!==thicknessAxis)
                const ax = planeAxes[0], ay = planeAxes[1]
                const frontVal = max.getComponent(thicknessAxis)
                const corner = (ux:number, uy:number) => {
                    const v = new THREE.Vector3()
                    v.setComponent(ax, ux ? max.getComponent(ax) : min.getComponent(ax))
                    v.setComponent(ay, uy ? max.getComponent(ay) : min.getComponent(ay))
                    v.setComponent(thicknessAxis, frontVal)
                    return v
                }
                const c00 = corner(0,0), c10 = corner(1,0), c01 = corner(0,1), c11 = corner(1,1)
                let widthVec = c10.clone().sub(c00)
                let heightVec = c01.clone().sub(c00)
                let normalVec = widthVec.clone().cross(heightVec); if (normalVec.lengthSq()===0) normalVec.set(0,0,1)
                normalVec.normalize()
                const worldNormalTest = normalVec.clone().applyQuaternion(d.mesh.getWorldQuaternion(new THREE.Quaternion()))
                if (worldNormalTest.z < 0) { widthVec.negate(); heightVec.negate(); normalVec.negate() }
                const widthLen = widthVec.length()
                const heightLen = heightVec.length()
                const widthDir = widthVec.clone().normalize()
                const heightDir = heightVec.clone().normalize()
                heightDir.sub(widthDir.clone().multiplyScalar(heightDir.dot(widthDir))).normalize()
                normalVec.copy(widthDir).cross(heightDir).normalize()
                const localBasis = new THREE.Matrix4().makeBasis(widthDir, heightDir, normalVec)
                const planeLocalQuat = new THREE.Quaternion().setFromRotationMatrix(localBasis)
                const centerLocal = c00.clone().add(c10).add(c11).add(c01).multiplyScalar(0.25)
                // Apply screen overlay scaling configuration
                const innerWidth = widthLen * BEZEL_SCALE * 1.06 * SCREEN_OVERLAY_SCALE
                const innerHeight = heightLen * BEZEL_SCALE * SCREEN_OVERLAY_SCALE
                screenWidthRef.current = innerWidth
                screenHeightRef.current = innerHeight
                const anchor = new THREE.Group()
                anchor.position.copy(centerLocal)
                anchor.quaternion.copy(planeLocalQuat)
                d.mesh.add(anchor)
                const planeGeo = new THREE.PlaneGeometry(innerWidth, innerHeight)
                const planeMat = new THREE.MeshBasicMaterial({ map: textureRef.current!, toneMapped: false, side: THREE.DoubleSide })
                const plane = new THREE.Mesh(planeGeo, planeMat)
                plane.position.set(0,0.5,-0.552) // slight offset to avoid z-fighting
                anchor.add(plane)
                screenPlaneRef.current = plane
                screenAnchorRef.current = anchor
            } else {
                const anchor = new THREE.Group()
                anchor.position.set(0, 0.05, -0.1)
                anchor.rotation.set(-0.15, 0, 0)
                // Apply screen overlay scaling to fallback dimensions
                screenWidthRef.current = FALLBACK_SCREEN.width * BEZEL_SCALE * SCREEN_OVERLAY_SCALE
                screenHeightRef.current = FALLBACK_SCREEN.height * BEZEL_SCALE * SCREEN_OVERLAY_SCALE
                const planeGeo = new THREE.PlaneGeometry(screenWidthRef.current, screenHeightRef.current)
                const planeMat = new THREE.MeshBasicMaterial({ map: textureRef.current!, toneMapped: false, side: THREE.DoubleSide })
                const plane = new THREE.Mesh(planeGeo, planeMat)
                plane.position.set(0,0.5,-0.5)
                anchor.add(plane)
                screenPlaneRef.current = plane
                screenAnchorRef.current = anchor
                laptop.add(anchor)
            }
            needsRedrawRef.current = true
            updateVisibility()
        }, undefined, (e) => console.error('Laptop load error', e))

        const handleMouseDown = (e: MouseEvent) => {
            if (getCanvasCoords(e.clientX, e.clientY)) return // click on screen -> no rotate
            isDraggingRef.current = true; setIsDragging(true); previousMousePositionRef.current = {x:e.clientX,y:e.clientY}
        }
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !laptopRef.current) return
            const dx = e.clientX - previousMousePositionRef.current.x
            const dy = e.clientY - previousMousePositionRef.current.y
            laptopRef.current.rotation.y += dx * 0.01
            laptopRef.current.rotation.x += dy * 0.01
            laptopRef.current.rotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, laptopRef.current.rotation.x))
            previousMousePositionRef.current = {x:e.clientX,y:e.clientY}
            updateVisibility()
        }
        const handleMouseUp = () => { isDraggingRef.current = false; setIsDragging(false) }
        mountRef.current.addEventListener('mousedown', handleMouseDown)
        renderer.domElement.addEventListener('mousemove', handlePointerMove)
        renderer.domElement.addEventListener('mouseleave', handlePointerLeave)
        renderer.domElement.addEventListener('click', handleClick)
        renderer.domElement.addEventListener('wheel', handleWheel, { passive: false })
        renderer.domElement.addEventListener('contextmenu', e => e.preventDefault())
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        // Removed global document click/wheel

        const handleResize = () => {
            resizeFromContainer()
            updateVisibility()
        }
        window.addEventListener('resize', handleResize)

        const animate = () => {
            requestAnimationFrame(animate)
            if (AUTO_ROTATE_SPEED && !isDraggingRef.current && laptopRef.current) {
                laptopRef.current.rotation.y += AUTO_ROTATE_SPEED
                updateVisibility()
            }
            drawUI()
            renderer.render(scene, camera)
        }
        animate()

        return () => {
            initializedRef.current = false
            mountRef.current?.removeEventListener('mousedown', handleMouseDown)
            renderer.domElement.removeEventListener('mousemove', handlePointerMove)
            renderer.domElement.removeEventListener('mouseleave', handlePointerLeave)
            renderer.domElement.removeEventListener('click', handleClick)
            renderer.domElement.removeEventListener('wheel', handleWheel)
            renderer.domElement.removeEventListener('contextmenu', e => e.preventDefault())
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('resize', handleResize)
            if (rendererRef.current) { rendererRef.current.dispose(); rendererRef.current = undefined }
        }
    }, [resizeFromContainer, updateVisibility])

    return (
        <div className={styles.laptopSection}>
            <div 
                ref={mountRef} 
                className={styles.laptopContainer} 
                style={{ 
                    position: 'relative', 
                    cursor: isDragging ? 'grabbing' : 'grab', 
                    overflow: 'visible',
                    // Apply scaling configuration via CSS custom properties
                    '--container-width-scale': CONTAINER_WIDTH_SCALE.toString(),
                    '--container-height-scale': CONTAINER_HEIGHT_SCALE.toString()
                } as React.CSSProperties} 
            />
            
            {/* Fullscreen Button */}
            <div className={styles.fullscreenButtonContainer}>
                <button 
                className={styles.fullscreenButton}
                onClick={() => setIsFullscreen(true)}
                title="Open projects in fullscreen"
            >
                <div className={styles.fullscreenIcon}>⛶</div>
            </button>
            <p className={styles.fullscreenCaption}>
                Click to Enter Full Screen
            </p>
            </div>
            
            
            {isFullscreen && (
                <div className={styles.fullscreenOverlay} onClick={() => setIsFullscreen(false)}>
                    <div className={styles.fullscreenContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setIsFullscreen(false)}>×</button>
                        <div className={styles.webpageContent}>
                            <header className={styles.webpageHeader}>
                                <h1>My Projects</h1>
                                <p>Click the links to check projects out</p>
                            </header>
                            <div className={styles.webpageProjects}>
                                {cardsRef.current.map(card => (
                                    <div key={card.id} className={styles.projectCard} style={{ cursor: 'default', pointerEvents: 'auto' }}>
                                        <div className={styles.projectImageSection}>
                                            {card.image ? (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    background: card.gradient || card.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    borderRadius: '12px'
                                                }}>
                                                    <img 
                                                        src={card.image} 
                                                        alt={card.title}
                                                        style={{
                                                            objectFit: card.imageSize === 'contain' ? 'contain' : 
                                                                      card.imageSize === 'fill' ? 'fill' : 'cover',
                                                            width: '100%',
                                                            height: '100%'
                                                        }}
                                                    />
                                                </div>
                                            ) : card.gradient ? (
                                                <div 
                                                    className={styles.projectGradient}
                                                    style={{ background: card.gradient }}
                                                />
                                            ) : (
                                                <div 
                                                    className={styles.projectGradient}
                                                    style={{ background: card.color }}
                                                />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 8px', color: '#4fc3f7', fontFamily: 'Arial', fontWeight: 600 }}>{card.title}</h3>
                                            <p style={{ margin: '0 0 12px', color: '#ccc', lineHeight: 1.4 }}>{card.desc}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {/* Removed "View Project →" link - cards are no longer clickable */}
                                                
                                                {/* GitHub button */}
                                                {card.github && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); window.open(card.github, '_blank') }}
                                                        className={styles.iconButton}
                                                        title="View on GitHub"
                                                    >
                                                        <img src="/logos/githubicon.png" alt="GitHub" style={{ width: 20, height: 20 }} />
                                                    </button>
                                                )}
                                                
                                                {/* Devpost button */}
                                                {card.devpost && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); window.open(card.devpost, '_blank') }}
                                                        className={styles.iconButton}
                                                        title="View on Devpost"
                                                    >
                                                        <img src="/logos/devpost.png" alt="Devpost" style={{ width: 20, height: 20 }} />
                                                    </button>
                                                )}
                                                
                                                {/* Demo button */}
                                                {card.demo && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); window.open(card.demo, '_blank') }}
                                                        className={styles.iconButton}
                                                        title="View Demo"
                                                    >
                                                        <div className={styles.playButton}>
                                                            <div className={styles.playTriangle}></div>
                                                        </div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LaptopBackground