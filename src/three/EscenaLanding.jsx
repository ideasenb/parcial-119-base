import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GRUPOS } from '../data/grupos.js'

const RUTA_MODELO = '/models/cuartel.glb'
const TAMANO_MODELO = 5

function Cuartel() {
  const ref = useRef()
  const { scene } = useGLTF(RUTA_MODELO)
  const copia = useMemo(() => scene.clone(), [scene])

  const { escala, posicion } = useMemo(() => {
    const caja = new THREE.Box3().setFromObject(copia)
    const tamano = caja.getSize(new THREE.Vector3())
    const centro = caja.getCenter(new THREE.Vector3())
    const escala = TAMANO_MODELO / Math.max(tamano.x, tamano.y, tamano.z)
    return { escala, posicion: [-centro.x * escala, -caja.min.y * escala, -centro.z * escala] }
  }, [copia])

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.15
  })

  return (
    <group ref={ref} onClick={(e) => e.stopPropagation()}>
      <primitive object={copia} scale={escala} position={posicion} />
    </group>
  )
}

function Orbe({ grupo, indice, noche }) {
  const [encima, setEncima] = useState(false)
  const angulo = (indice / GRUPOS.length) * Math.PI * 2

  return (
    <mesh
      position={[Math.cos(angulo) * 4.2, 3.6, Math.sin(angulo) * 4.2]}
      scale={encima ? 1.7 : 1}
      onPointerOver={() => setEncima(true)}
      onPointerOut={() => setEncima(false)}
    >
      <sphereGeometry args={[0.2, 24, 24]} />
      <meshStandardMaterial color={grupo.color} emissive={grupo.color} emissiveIntensity={encima || noche ? 1 : 0.5} />
    </mesh>
  )
}

function Orbes({ noche }) {
  const ref = useRef()

  useFrame((state, delta) => {
    ref.current.rotation.y -= delta * 0.5
    ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.15
  })

  return (
    <group ref={ref}>
      {GRUPOS.map((g, i) => (
        <Orbe key={g.codigo} grupo={g} indice={i} noche={noche} />
      ))}
    </group>
  )
}

function Mundo({ dia }) {
  return (
    <>
      <color attach="background" args={[dia ? '#bfe3ff' : '#0b1026']} />
      <ambientLight intensity={dia ? 0.9 : 0.3} />
      <directionalLight position={[4, 6, 3]} intensity={dia ? 1.6 : 0.5} color={dia ? '#ffffff' : '#9db4ff'} />
      {!dia && <pointLight position={[0, 2, 5]} intensity={30} distance={14} color="#ffcf8a" />}

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7, 48]} />
        <meshStandardMaterial color={dia ? '#7ec850' : '#1f3b2d'} />
      </mesh>

      <Suspense fallback={null}>
        <Cuartel />
      </Suspense>
      <Orbes noche={!dia} />
    </>
  )
}

export default function EscenaLanding() {
  const [dia, setDia] = useState(true)

  return (
    <Canvas
      camera={{ position: [7, 4, 9], fov: 45 }}
      style={{ height: '100%' }}
      onPointerMissed={() => setDia(!dia)}
    >
      <Mundo dia={dia} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        target={[0, 1.2, 0]}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  )
}
