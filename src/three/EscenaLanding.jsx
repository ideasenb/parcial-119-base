import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const RUTA_CUARTEL = '/models/cuartel.glb'
const RUTA_FUEGO = '/models/fuego.glb'
const TAMANO_CUARTEL = 30
const TAMANO_FUEGO = 3
const CANTIDAD_FUEGOS = 6

function medir(modelo, tamanoDeseado, enElPiso) {
  const caja = new THREE.Box3().setFromObject(modelo)
  const tamano = caja.getSize(new THREE.Vector3())
  const centro = caja.getCenter(new THREE.Vector3())
  const escala = tamanoDeseado / Math.max(tamano.x, tamano.y, tamano.z)
  const y = enElPiso ? -caja.min.y : -centro.y
  return { escala, ajuste: [-centro.x * escala, y * escala, -centro.z * escala] }
}

function Cuartel() {
  const { scene } = useGLTF(RUTA_CUARTEL)
  const copia = useMemo(() => scene.clone(), [scene])
  const { escala, ajuste } = useMemo(() => medir(copia, TAMANO_CUARTEL, true), [copia])

  return (
    <group onClick={(e) => e.stopPropagation()}>
      <primitive object={copia} scale={escala} position={ajuste} />
    </group>
  )
}

function Fuego({ posicion, noche }) {
  const ref = useRef()
  const { scene, animations } = useGLTF(RUTA_FUEGO)
  const copia = useMemo(() => clone(scene), [scene])
  const { escala, ajuste } = useMemo(() => medir(copia, TAMANO_FUEGO, false), [copia])
  const { actions, names } = useAnimations(animations, ref)
  const [encima, setEncima] = useState(false)

  useEffect(() => {
    names.forEach((nombre) => actions[nombre].reset().play())
  }, [actions, names])

  useFrame((state) => {
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 2 + posicion[0]) * 0.15
  })

  return (
    <group position={posicion}>
      <group
        ref={ref}
        scale={encima ? 1.6 : 1}
        onPointerOver={() => setEncima(true)}
        onPointerOut={() => setEncima(false)}
      >
        <primitive object={copia} scale={escala} position={ajuste} />
        <mesh>
          <sphereGeometry args={[1.1, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {noche && <pointLight color="#ff7a1a" intensity={15} distance={8} position={[0, 0.5, 0]} />}
      </group>
    </group>
  )
}

function Fuegos({ noche }) {
  const radio = TAMANO_CUARTEL * 0.8

  return (
    <>
      {Array.from({ length: CANTIDAD_FUEGOS }, (_, i) => {
        const angulo = (i / CANTIDAD_FUEGOS) * Math.PI * 2
        return (
          <Fuego
            key={i}
            posicion={[Math.cos(angulo) * radio, 1, Math.sin(angulo) * radio]}
            noche={noche}
          />
        )
      })}
    </>
  )
}

function Mundo({ dia }) {
  return (
    <>
      <color attach="background" args={[dia ? '#bfe3ff' : '#0b1026']} />
      <ambientLight intensity={dia ? 0.9 : 0.3} />
      <directionalLight position={[4, 6, 3]} intensity={dia ? 1.6 : 0.5} color={dia ? '#ffffff' : '#9db4ff'} />
      {!dia && <pointLight position={[0, 3, 8]} intensity={40} distance={20} color="#ffcf8a" />}

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color={dia ? '#7ec850' : '#1f3b2d'} />
      </mesh>

      <Suspense fallback={null}>
        <Cuartel />
        <Fuegos noche={!dia} />
      </Suspense>
    </>
  )
}

export default function EscenaLanding() {
  const [dia, setDia] = useState(true)

  return (
    <Canvas
      camera={{ position: [11, 5.5, 14], fov: 45 }}
      style={{ height: '100%' }}
      onPointerMissed={() => setDia(!dia)}
    >
      <Mundo dia={dia} />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
        target={[0, 2.5, 0]}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  )
}
