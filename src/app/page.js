'use client';

import { useEffect, useState } from 'react';
import carInfo from '@/data/car_info.json';
import stopInfo from '@/data/stop_info.json';
import './font.css';

const PAIRED_ROWS = [
  { left: { idx: 1, name: "죽전마을" }, right: { idx: 34, name: "죽전마을" } },
  { left: { idx: 2, name: "서울슈퍼" }, right: { idx: 33, name: "서울슈퍼" } },
  { left: { idx: 3, name: "금성동주민센터" }, right: { idx: 32, name: "금성동주민센터" } },
  { left: { idx: 4, name: "공해부락" }, right: { idx: 31, name: "공해부락" } },
  { left: { idx: 5, name: "남문" }, right: { idx: 30, name: "남문" } },
  { left: { idx: 6, name: "동문" }, right: { idx: 29, name: "동문" } },
  { left: { idx: 7, name: "고별대" }, right: { idx: 28, name: "고별대" } },
  { left: { idx: 8, name: "삼밭골" }, right: { idx: 27, name: "삼밭골" } },
  { left: { idx: 9, name: "부산대후문" }, right: { idx: 26, name: "부산대후문" } },
  { left: null, right: { idx: 25, name: "양로원" } }, 
  { left: { idx: 10, name: "광명사" }, right: { idx: 24, name: "광명사" } },
  { left: { idx: 11, name: "식물원" }, right: { idx: 23, name: "식물원" } },
  { left: { idx: 12, name: "금정산SK뷰" }, right: { idx: 22, name: "금정산SK뷰" } },
  { left: { idx: 13, name: "래미안포레스티지 1단지" }, right: { idx: 21, name: "래미안포레스티지 1단지" } },
  { left: { idx: 14, name: "경보아파트교차로" }, right: { idx: 20, name: "경보아파트교차로" } },
  { left: { idx: 15, name: "온천시장(목욕타운)" }, right: { idx: 19, name: "온천시장(목욕타운)" } },
  { left: { idx: 16, name: "온천장역" }, right: { idx: 18, name: "온천장역.SK허브스카이" } },
  { left: { idx: 17, name: "온천장" }, right: null, isLoopBottom: true }
];

function BusIcon({ plateNumber }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = `/images/${plateNumber}.png`;

  if (imgError) {
    return <div className="w-10 h-10 flex items-center justify-center bg-yellow-500 rounded-lg text-gray-900 font-bold text-sm shadow-inner">🚌</div>;
  }
  return <img src={imgSrc} alt={plateNumber} className="w-10 h-10 object-contain bg-gray-800 p-0.5 rounded-lg border border-gray-700 shadow-sm" onError={() => setImgError(true)} />;
}

export default function BusTracker() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null); 
  const [selectedStop, setSelectedStop] = useState(null);

  const fetchBusData = async () => {
    try {
      const res = await fetch('/api/bus');
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.getElementsByTagName('item');
      const busList = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const carno = item.getElementsByTagName('carno')[0]?.textContent;
        if (carno) {
          busList.push({
            carno: carno.trim(),
            bstopnm: item.getElementsByTagName('bstopnm')[0]?.textContent,
            bstopidx: parseInt(item.getElementsByTagName('bstopidx')[0]?.textContent, 10),
          });
        }
      }
      setBuses(busList);
    } catch (error) {
      console.error('데이터 갱신 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusData();
    const interval = setInterval(fetchBusData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStopClick = (stop) => {
    if (!stop) return;
    const details = stopInfo[stop.name] || {
      origin: "아직 아무것도 적히지 않았어요...",
      spots: "아직 아무것도 적히지 않았어요..."
    };
    setSelectedStop({ ...stop, ...details });
  };

  return (
    <main className="max-w-5xl mx-auto min-h-screen bg-gray-950 text-gray-100 py-10 font-custom select-none">
      <header className="mb-10 text-center border-b border-gray-900 pb-5">
        <h1 className="text-3xl font-black text-yellow-400 tracking-widest font-mono">203 운행 현황</h1>
        <p className="text-xs text-gray-500 mt-2 tracking-wide">💡 정류장 이름을 클릭하면 주변 볼거리와 유래를 볼 수 있습니다.</p>
      </header>

      {loading ? (
        <div className="text-center text-gray-600 animate-pulse text-sm">시스템 로딩 중...</div>
      ) : (
        <div className="flex flex-col items-center">
          
          <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="min-w-[760px] px-6 md:mx-auto flex flex-col">
              <div className="grid grid-cols-[130px_160px_40px_60px_40px_160px_130px] text-center mb-4 text-xs font-bold text-gray-500 tracking-wider">
                <div className="text-right pr-4">하행 (온천장 방면) ↓</div>
                <div></div><div></div><div></div><div></div><div></div>
                <div className="text-left pl-4">상행 (산성마을 방면) ↑</div>
              </div>

            {PAIRED_ROWS.map((row, rIdx) => {
              const leftBuses = row.left ? buses.filter(bus => bus.bstopidx === row.left.idx) : [];
              const rightBuses = row.right ? buses.filter(bus => bus.bstopidx === row.right.idx) : [];

              return (
                <div key={rIdx} className={`grid grid-cols-[130px_140px_40px_60px_40px_140px_130px] items-center relative ${row.isLoopBottom ? 'h-44' : 'h-16'}`}>
                  
                  <div className="flex flex-col items-end justify-center pr-3 gap-1">
                    {!row.isLoopBottom && leftBuses.map((bus, bIdx) => {
                      const plateNumber = bus.carno.slice(-4);
                      const cleanCarno = bus.carno.replace('부산', '').trim();
                      const details = carInfo[cleanCarno] || carInfo[bus.carno];

                      return (
                        <div 
                          key={bIdx} 
                          onClick={() => setSelectedBus({ bus, details: details || null })} 
                          className="flex items-center gap-2 bg-gray-900/90 border border-blue-500/40 rounded-xl p-1.5 pl-3 pr-2 shadow-md hover:border-yellow-400 cursor-pointer transition-all active:scale-95 w-32 justify-between"
                        >
                          <div className="text-blue-400 font-black text-sm font-mono">{plateNumber} ↓</div>
                          <BusIcon plateNumber={plateNumber} />
                        </div>
                      );
                    })}
                  </div>

                  <div 
                    onClick={() => handleStopClick(row.left)}
                    className={`text-right pr-4 text-xs font-semibold tracking-tight cursor-pointer hover:text-white transition-colors group whitespace-nowrap ${leftBuses.length > 0 ? 'text-blue-400 font-bold' : 'text-gray-400'}`}
                  >
                    {!row.isLoopBottom && row.left ? (
                      <>
                        <span className="text-xxs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity mr-1">🔍</span>
                        {row.left.name} <span className="text-xxs text-gray-700 font-mono">#{row.left.idx}</span>
                      </>
                    ) : ""}
                  </div>

                  {row.isLoopBottom ? (
                    <div className="col-start-3 col-end-6 h-full relative flex justify-center">
                      <div className="absolute top-0 left-[17px] right-[17px] h-[46px] border-l-[6px] border-r-[6px] border-b-[6px] border-blue-600 rounded-b-full"></div>
                      
                      <div 
                        onClick={() => handleStopClick(row.left)} 
                        className={`absolute top-[43px] -translate-y-1/2 w-3.5 h-3.5 rounded-full z-10 cursor-pointer transition-all border-2 ${leftBuses.length > 0 ? 'bg-yellow-400 border-yellow-300 scale-125 shadow-[0_0_10px_rgba(234,179,8,0.6)]' : 'bg-gray-950 border-gray-600 hover:border-white'}`}
                      ></div>
                      
                      <div 
                        onClick={() => handleStopClick(row.left)}
                        className={`absolute top-[60px] text-xs font-semibold tracking-tight cursor-pointer hover:text-white transition-colors whitespace-nowrap z-20 flex items-center
                          ${leftBuses.length > 0 ? 'text-blue-400 font-bold drop-shadow-md scale-105' : 'text-gray-400'}`}
                      >
                        {row.left.name} <span className="text-xxs opacity-60 font-mono ml-1">#{row.left.idx}</span>
                      </div>

                      <div className="absolute top-[86px] flex flex-col gap-2 items-center z-30 w-full">
                        {leftBuses.map((bus, bIdx) => {
                          const plateNumber = bus.carno.slice(-4);
                          const cleanCarno = bus.carno.replace('부산', '').trim();
                          const details = carInfo[cleanCarno] || carInfo[bus.carno];

                          return (
                            <div 
                              key={bIdx} 
                              onClick={() => setSelectedBus({ bus, details: details || null })} 
                              className="flex items-center gap-3 bg-gray-900/90 border border-blue-500/40 rounded-xl p-1.5 px-4 shadow-md hover:border-yellow-400 cursor-pointer transition-all active:scale-95 w-fit"
                            >
                              <div className="text-blue-400 font-black text-sm font-mono">{plateNumber} ↓</div>
                              <BusIcon plateNumber={plateNumber} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative h-full w-full flex justify-center items-center">
                        <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-blue-600 -translate-x-1/2"></div>
                        {row.left && (
                          <div onClick={() => handleStopClick(row.left)} className={`w-3.5 h-3.5 rounded-full z-10 cursor-pointer transition-all border-2 ${leftBuses.length > 0 ? 'bg-yellow-400 border-yellow-300 scale-125 shadow-[0_0_10px_rgba(234,179,8,0.6)]' : 'bg-gray-950 border-gray-600 hover:border-white'}`}></div>
                        )}
                      </div>

                      <div className="relative h-full w-full"></div>

                      <div className="relative h-full w-full flex justify-center items-center">
                        <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-blue-600 -translate-x-1/2"></div>
                        {row.right && (
                          <div onClick={() => handleStopClick(row.right)} className={`w-3.5 h-3.5 rounded-full z-10 cursor-pointer transition-all border-2 ${rightBuses.length > 0 ? 'bg-yellow-400 border-yellow-300 scale-125 shadow-[0_0_10px_rgba(234,179,8,0.6)]' : 'bg-gray-950 border-gray-600 hover:border-white'}`}></div>
                        )}
                      </div>
                    </>
                  )}

                  <div 
                    onClick={() => handleStopClick(row.right)}
                    className={`text-left pl-4 text-xs font-semibold tracking-tight cursor-pointer hover:text-white transition-colors group whitespace-nowrap ${rightBuses.length > 0 ? 'text-green-400 font-bold' : 'text-gray-400'}`}
                  >
                    {row.right ? (
                      <>
                        <span className="text-xxs text-gray-700 font-mono">#{row.right.idx}</span> {row.right.name}
                        <span className="text-xxs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1">🔍</span>
                      </>
                    ) : ""}
                  </div>

                  <div className="flex flex-col items-start justify-center pl-3 gap-1">
                    {rightBuses.map((bus, bIdx) => {
                      const plateNumber = bus.carno.slice(-4);
                      const cleanCarno = bus.carno.replace('부산', '').trim();
                      const details = carInfo[cleanCarno] || carInfo[bus.carno];

                      return (
                        <div 
                          key={bIdx} 
                          onClick={() => setSelectedBus({ bus, details: details || null })}
                          className="flex items-center gap-2 bg-gray-900/90 border border-green-500/40 rounded-xl p-1.5 pr-3 pl-2 shadow-md hover:border-yellow-400 cursor-pointer transition-all active:scale-95 w-32 justify-between"
                        >
                          <BusIcon plateNumber={plateNumber} />
                          <div className="text-left text-green-400 font-black text-sm font-mono">↑ {plateNumber}</div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      {selectedBus && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedBus(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-5 text-gray-400 hover:text-white text-xl font-mono" onClick={() => setSelectedBus(null)}>✕</button>
            <header className="mb-5">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">{selectedBus.details?.fuel || "연료 미상"}</span>
                <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded-full">{selectedBus.details?.Euro || "Euro 규격 미상"}</span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1.5 font-mono tracking-wide">{selectedBus.bus.carno}</h3>
              <p className="text-xs text-gray-400 mt-1">현재 정류장: <span className="text-yellow-400 font-bold">{selectedBus.bus.bstopnm}</span> (#{selectedBus.bus.bstopidx})</p>
            </header>
            <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-950 text-xs">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-gray-900"><td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400 w-1/3">차종</td><td className="px-4 py-3 text-gray-200 font-medium">{selectedBus.details?.model || "정보 없음"}</td></tr>
                  <tr className="border-b border-gray-900"><td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400">연식</td><td className="px-4 py-3 text-gray-200">{selectedBus.details?.year ? `${selectedBus.details.year}년식` : "정보 없음"}</td></tr>
                  <tr className="border-b border-gray-900"><td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400">엔진</td><td className="px-4 py-3 text-gray-200 font-mono">{selectedBus.details?.engine || "정보 없음"}</td></tr>
                  <tr className="border-b border-gray-900"><td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400">배기량</td><td className="px-4 py-3 text-gray-200">{selectedBus.details?.displacement || "정보 없음"}</td></tr>
                  <tr className="border-b border-gray-900"><td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400">변속기</td><td className="px-4 py-3 text-gray-200 font-mono">{selectedBus.details?.transmission || "정보 없음"}</td></tr>
                  <tr className="border-b border-gray-900"><td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400">제작 연월일</td><td className="px-4 py-3 text-gray-200">{selectedBus.details?.manufacture || "정보 없음"}</td></tr>
                  <tr className="border-b border-gray-900"><td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400">최초 등록일</td><td className="px-4 py-3 text-gray-200">{selectedBus.details?.registration || "정보 없음"}</td></tr>
                  <tr><td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400">승차 인원</td><td className="px-4 py-3 text-gray-200">{selectedBus.details?.capacity || "정보 없음"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedStop && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedStop(null)}>
          <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-5 text-gray-400 hover:text-white text-xl font-mono" onClick={() => setSelectedStop(null)}>✕</button>
            <header className="mb-4">
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">STOP INFO</span>
              <h3 className="text-2xl font-black text-white mt-1">{selectedStop.name}</h3>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">고유번호: #{selectedStop.idx}</p>
            </header>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                <h4 className="text-emerald-400 font-bold mb-1.5">📋 정류장 이름의 유래</h4>
                <p className="text-gray-300">{selectedStop.origin}</p>
              </div>
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                <h4 className="text-yellow-400 font-bold mb-1.5">📍 주변 추천 볼거리 / 먹거리</h4>
                <p className="text-gray-300">{selectedStop.spots}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
