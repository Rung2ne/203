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
  const [activeTab, setActiveTab] = useState('main');
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);

  const historicalCars = [
    { carNum: "2965", model: "'09 대우 BS090 로얄미디 F/L", fuel: "NGV", engine: "GE08TI", displacement: "8.0L", mileage: "585,419km(추정)", date: "2018-03", regDate: "2009/03/19", cancelDate: "2018/03/30", isFirst: true, rowSpan: 4 },
    { carNum: "2965", model: "'13 대우 NEW BS090", fuel: "디젤", engine: "DL06K", displacement: "5.9L", mileage: "365,000km(추정)", date: "2022-07", regDate: "2013/02/01", cancelDate: "2022/07/22", isFirst: false },
    { carNum: "2965", model: "'15 대우 NEW BS090", fuel: "디젤", engine: "ISB6.7E6", displacement: "6.7L", mileage: "609,338km", date: "2026-06", regDate: "2015/11/25", cancelDate: "2026/06/18", isFirst: false },
    { carNum: "2965", model: "'20 현대 그린시티 F/L", fuel: "CNG", engine: "C6GB", displacement: "6.8L", mileage: "348,000km", date: "2026-06", regDate: "2020/09/25", cancelDate: "운행 중", isFirst: false },
    
    { carNum: "2966", model: "'09 대우 BS090 로얄미디 F/L", fuel: "NGV", engine: "GE08TI", displacement: "8.0L", mileage: "541,989km(추정)", date: "2018-03", regDate: "2009/03/19", cancelDate: "2018/03/27", isFirst: true, rowSpan: 3 },
    { carNum: "2966", model: "'16 대우 NEW BS090", fuel: "디젤", engine: "ISB6.7E6", displacement: "6.7L", mileage: "491,374km", date: "2026-04", regDate: "2016/03/29", cancelDate: "2026/04/22", isFirst: false },
    { carNum: "2966", model: "'20 NSAC 저상 2차 F/L", fuel: "CNG", engine: "C6AF", displacement: "11.6L", mileage: "345,669km", date: "2026-07", regDate: "2020/05/15", cancelDate: "운행 중", isFirst: false },
  ];

  const behindStories = [
    { title: "🏔️ 성산과 대륙산악회", content: "t" },
    { title: "🍾 산성막걸리", content: "t" }
  ];

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
      <div className="border-b border-gray-800 bg-gray-900/50 sticky top-0 backdrop-blur-md z-40 mb-8 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-2xl mx-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-emerald-400 tracking-wider cursor-pointer" onClick={() => setActiveTab('main')}>
            203번 가이드
          </span>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md font-mono">v1.3.7</span>
        </div>

      <div className="flex gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs font-bold">
        <button onClick={() => setActiveTab('main')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'main' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>노선도</button>
        <button onClick={() => setActiveTab('records')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'records' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>역대 차량현황</button>
        <button onClick={() => setActiveTab('behind')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'behind' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>비하인드 스토리</button>
        <button onClick={() => setActiveTab('credits')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'credits' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>크레딧</button>
      </div>
    </div>

    {activeTab === 'main' && (
      <>
        <header className="mb-6 px-4 flex flex-col sm:flex-row justify-between items-center border-b border-gray-900 pb-5 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-black text-yellow-400 tracking-widest font-mono">203번 운행 현황</h1>
            <p className="text-xs text-gray-500 mt-2 tracking-wide">💡 정류장 이름을 클릭하면 추천하는 주변에서 할 일과 정류장 이름의 유래를 볼 수 있어요!</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchBusData} 
              disabled={loading}
              className="bg-gray-900 border border-emerald-500/30 hover:bg-emerald-950/40 text-emerald-400 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 disabled:opacity-50"
            >
              {loading ? '🔄 갱신 중...' : '🔄 새로고침'}
            </button>
            <button 
              onClick={() => setIsTimetableOpen(true)}
              className="bg-gray-900 border border-emerald-500/30 hover:bg-emerald-950/40 text-emerald-400 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md flex items-center gap-1"
            >
              📅 운행 시간표
            </button>
          </div>
        </header>

      {loading ? (
        <div className="text-center text-gray-600 animate-pulse text-sm">시스템 로딩 중...</div>
      ) : (
        <div className="flex flex-col items-center">
          
          <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="min-w-[760px] px-6 md:mx-auto flex flex-col">
              <div className="grid grid-cols-[145px_145px_40px_60px_40px_145px_145px] text-center mb-4 text-xs font-bold text-gray-500 tracking-wider">
                <div className="text-right pr-4">하행 (온천장 방면) ↓</div>
                <div></div><div></div><div></div><div></div><div></div>
                <div className="text-left pl-4">상행 (산성마을 방면) ↑</div>
              </div>

            {PAIRED_ROWS.map((row, rIdx) => {
              const leftBuses = row.left ? buses.filter(bus => bus.bstopidx === row.left.idx) : [];
              const rightBuses = row.right ? buses.filter(bus => bus.bstopidx === row.right.idx) : [];

              return (
                <div key={rIdx} className={`grid grid-cols-[145px_145px_40px_60px_40px_145px_145px] items-center relative ${row.isLoopBottom ? 'h-44' : 'h-16'}`}>
                  
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
        </>
      )}

    {activeTab === 'records' && (
      <div className="px-4 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-black text-white">역대 차량현황</h2>
          <p className="text-xs text-gray-500 mt-0.5">203번 버스로 산성마을과 온천장 사이를 이어온 차량들의 상세 제원입니다.</p>
        </div>
        <div className="w-full overflow-x-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full border-collapse border-hidden text-left text-xs min-w-max whitespace-nowrap">
            <thead>
              <tr className="bg-gray-950 text-gray-400 font-bold border-b border-gray-800">
                <th className="px-4 py-3 text-center text-emerald-400">차호</th>
                <th className="px-4 py-3 text-center">차종</th>
                <th className="px-4 py-3 text-center">연료</th>
                <th className="px-4 py-3 text-center">엔진</th>
                <th className="px-4 py-3 text-center">배기량</th>
                <th className="px-4 py-3 text-center">주행거리</th>
                <th className="px-4 py-3 text-center">최초등록일</th>
                <th className="px-4 py-3 text-center">말소등록일</th>
                <th className="px-4 py-3 text-center">기준연월</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {historicalCars.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-850/40 transition-colors">
                  {row.isFirst && (
                    <td rowSpan={row.rowSpan} className="px-4 py-3 bg-gray-950 font-black text-center text-sm border-r border-gray-800 text-emerald-400 align-middle">
                      {row.carNum}호
                    </td>
                  )}
                  <td className="px-4 py-3 font-semibold text-white">{row.model}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{row.fuel}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-400">{row.engine}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-400">{row.displacement}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-400">{row.mileage}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-500">{row.regDate}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-500">
                    <span className={row.cancelDate === '운행 중' ? 'text-emerald-500 font-bold' : 'text-red-400/70'}>
                      {row.cancelDate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-gray-500">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {activeTab === 'behind' && (
      <div className="px-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-black text-white">비하인드 스토리</h2>
          <p className="text-xs text-gray-500 mt-0.5">공간 제약으로 노선도에 다 담지 못했던 깊은 이야기들입니다.</p>
        </div>
        <div className="space-y-4">
          {behindStories.map((story, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-emerald-400 mb-2">{story.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">{story.content}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {activeTab === 'credits' && (
      <div className="px-6 max-w-3xl mx-auto">
        <div className="bg-gray-900 border border-emerald-500/20 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-black text-white border-b border-gray-800 pb-2">크레딧</h3>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed font-sans">
              본 웹사이트는 203번 좌석버스를 이용하려는 타지인들과 버스 동호인들을 위해 제작된 비공식 가이드입니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <h4 className="text-emerald-400 font-bold mb-1.5">🛠️ 개발 및 디자인</h4>
              <p className="text-gray-300 font-medium">Rung2ne</p>
              <p className="text-gray-500 mt-0.5 font-mono text-[11px]">Next.js / Tailwind CSS / React</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <h4 className="text-emerald-400 font-bold mb-1.5">📊 참고 자료 및 API 출처</h4>
              <ul className="text-gray-300 space-y-1 list-disc list-inside font-sans">
                <li>부산광역시 부산버스정보시스템 API</li>
                <li>부산역사문화대전</li>
                <li>나무위키</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-[10px] text-gray-600 pt-2 border-t border-gray-800 font-mono">
            ©2026 203 Guide Project. All Rights Reserved.
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
                  <tr className="border-b border-gray-900"><td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400">배기량</td><td className="px-4 py-3 text-gray-200">{selectedBus.details?.displacement || "정보 없음"}</td></tr><tr className="border-b border-gray-900">
                    <td className="px-4 py-3 bg-gray-900/50 font-bold text-gray-400">주행거리</td>
                    <td className="px-4 py-3 text-gray-200 font-mono">{selectedBus.details?.mileage || "정보 없음"}{selectedBus.details?.date && (<span className="text-[10px] text-gray-500 font-sans ml-1.5">(기준일: {selectedBus.details.date})</span>)}</td></tr>
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
                <h4 className="text-emerald-400 font-bold mb-1.5">📋 정류장 이름과 관련하여......</h4>
                <p className="text-gray-300">{selectedStop.origin}</p>
              </div>
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                <h4 className="text-yellow-400 font-bold mb-1.5">📍 추천하는 주변에서 할 일</h4>
                <p className="text-gray-300">{selectedStop.spots}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {isTimetableOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setIsTimetableOpen(false)}>
          <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-5 text-gray-400 hover:text-white text-xl font-mono" onClick={() => setIsTimetableOpen(false)}>✕</button>
            
            <header className="mb-4">
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">TIMETABLE</span>
              <h3 className="text-2xl font-black text-white mt-1">🚌 운행 시간표</h3>
            </header>

            <div className="space-y-4 text-xs font-sans">
              <p className="text-gray-400 leading-relaxed">
                ※ 도로 상황 및 회사 사정에 따라 실제 운행 시간이 다소 변동될 수 있습니다.
              </p>
              <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-center text-gray-300">
                  <thead>
                    <tr className="bg-gray-900 text-emerald-400 font-bold border-b border-gray-800 text-[11px]">
                      <th className="p-2 border-r border-gray-800">구분</th>
                      <th className="p-2 border-r border-gray-800">평일</th>
                      <th className="p-2">토·일·공휴일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    <tr className="hover:bg-gray-900/30">
                      <td className="p-2.5 font-bold bg-gray-900/50 border-r border-gray-800 text-white">첫차</td>
                      <td className="p-2.5 border-r border-gray-800 font-mono">06:00</td>
                      <td className="p-2.5 font-mono">06:15</td>
                    </tr>
                    <tr className="hover:bg-gray-900/30">
                      <td className="p-2.5 font-bold bg-gray-900/50 border-r border-gray-800 text-white">막차</td>
                      <td className="p-2.5 border-r border-gray-800 font-mono">22:30</td>
                      <td className="p-2.5 font-mono">22:10</td>
                    </tr>
                    <tr className="hover:bg-gray-900/30">
                      <td className="p-2.5 font-bold bg-gray-900/50 border-r border-gray-800 text-white">배차 간격</td>
                      <td className="p-2.5 border-r border-gray-800">10 ~ 15분</td>
                      <td className="p-2.5">15 ~ 20분</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-[11px] text-gray-500 bg-gray-950 p-3 rounded-xl border border-gray-850">
                ℹ️ 출퇴근 시간대(07:30~09:00, 17:30~19:00)에는 유동적으로 집중 배차됩니다.
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
