import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function Home() {
  const webcamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState("");
  const [match, setMatch] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      setModelsLoaded(true);
    };
    load();
  }, []);

  async function handleCadastro() {
    setProcessing(true);
    setStatus("Processando cadastro...");
    setMatch("");
    const screenshot = webcamRef.current.getScreenshot();
    const img = await faceapi.fetchImage(screenshot);
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detections) {
      setStatus("Rosto não detectado.");
      setProcessing(false);
      return;
    }
    await fetch("/api/cadastro", {
      method: "POST",
      body: JSON.stringify({ embedding: Array.from(detections.descriptor) }),
      headers: { "Content-Type": "application/json" },
    });
    setStatus("Cadastro realizado com sucesso!");
    setProcessing(false);
  }

  async function handleReconhecer() {
    setProcessing(true);
    setMatch("Reconhecendo...");
    setStatus("");
    const screenshot = webcamRef.current.getScreenshot();
    const img = await faceapi.fetchImage(screenshot);
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detections) {
      setMatch("Rosto não detectado.");
      setProcessing(false);
      return;
    }
    const resp = await fetch("/api/reconhecer", {
      method: "POST",
      body: JSON.stringify({ embedding: Array.from(detections.descriptor) }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await resp.json();
    setMatch(data.match ? "Reconhecido! ✅" : "Não reconhecido. ❌");
    setProcessing(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #232526 0%, #414345 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(0,0,0,.13)",
        padding: 36,
        maxWidth: 380,
        width: "100%",
        textAlign: "center"
      }}>
        <h1 style={{marginBottom: 10, color: "#232526", fontSize: 28, letterSpacing: 0.2}}>Reconhecimento Facial</h1>
        <p style={{fontSize: 14, color: "#888", marginBottom: 18}}>Demo Next.js + face-api.js</p>
        <div style={{marginBottom: 18}}>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={270} height={200}
            style={{
              borderRadius: 10,
              boxShadow: "0 2px 10px rgba(60,60,60,.09)",
              border: "1.5px solid #eee"
            }}/>
        </div>
        <div style={{ margin: 12, display: "flex", justifyContent: "center" }}>
          <button disabled={!modelsLoaded || processing}
            onClick={handleCadastro}
            style={{
              background: "#2563eb",
              color: "#fff",
              padding: "10px 24px",
              fontSize: 16,
              border: "none",
              borderRadius: 8,
              marginRight: 10,
              boxShadow: "0 2px 6px #2563eb22",
              cursor: modelsLoaded && !processing ? "pointer" : "not-allowed",
              opacity: modelsLoaded && !processing ? 1 : 0.5,
              transition: ".2s"
            }}>
            {processing ? "Aguarde..." : "Cadastrar"}
          </button>
          <button disabled={!modelsLoaded || processing}
            onClick={handleReconhecer}
            style={{
              background: "#0ea47a",
              color: "#fff",
              padding: "10px 24px",
              fontSize: 16,
              border: "none",
              borderRadius: 8,
              marginLeft: 0,
              boxShadow: "0 2px 6px #0ea47a22",
              cursor: modelsLoaded && !processing ? "pointer" : "not-allowed",
              opacity: modelsLoaded && !processing ? 1 : 0.5,
              transition: ".2s"
            }}>
            {processing ? "Aguarde..." : "Reconhecer"}
          </button>
        </div>
        <div style={{minHeight:32, marginTop:10}}>
          {status && (
            <span style={{color:"#2563eb", fontWeight:600}}>{status}</span>
          )}
          {match && (
            <span style={{color: match.includes("✅") ? "#0ea47a" : "#ef4444", fontWeight:600}}>
              {match}
            </span>
          )}
        </div>
        <p style={{fontSize:11, color:'#999', marginTop: 30}}>
          <b>Obs:</b> Adicione os modelos do face-api.js em <code>/public/models</code> para funcionar.<br/>
          <span style={{color:"#888"}}>Para demo apenas, os dados não ficam salvos após restart.</span>
        </p>
      </div>
    </div>
  );
}
