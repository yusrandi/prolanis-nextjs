/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Menu } from "primereact/menu";
import React, { useContext, useEffect, useRef, useState } from "react";
import { LayoutContext } from "../../layout/context/layoutcontext";
import Link from "next/link";
import { Demo } from "../../types/types";
import { ChartData, ChartOptions } from "chart.js";
import { UserType } from "../../types/UserType";
import { onValue, orderByChild, query } from "firebase/database";
import { resepNormalRef, tipsMakananRef, tipsOlahragaRef, usersRef } from "../../lib/firebase";
import { TipsType } from "../../types/TipsType";
import { ResepType } from "../../types/resep";

const lineData: ChartData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "First Dataset",
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      backgroundColor: "#2f4860",
      borderColor: "#2f4860",
      tension: 0.4,
    },
    {
      label: "Second Dataset",
      data: [28, 48, 40, 19, 86, 27, 90],
      fill: false,
      backgroundColor: "#00bb7e",
      borderColor: "#00bb7e",
      tension: 0.4,
    },
  ],
};

const Dashboard = () => {
  const [products, setProducts] = useState<Demo.Product[]>([]);
  const menu1 = useRef<Menu>(null);
  const menu2 = useRef<Menu>(null);
  const [lineOptions, setLineOptions] = useState<ChartOptions>({});
  const { layoutConfig } = useContext(LayoutContext);

  const [users, setUsers] = useState<UserType[]>([])
  const [tips, setTips] = useState<TipsType[]>([])
  const [reseps, setReseps] = useState<ResepType[]>([])




  const applyLightTheme = () => {
    const lineOptions: ChartOptions = {
      plugins: {
        legend: {
          labels: {
            color: "#495057",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#495057",
          },
          grid: {
            color: "#ebedef",
          },
        },
        y: {
          ticks: {
            color: "#495057",
          },
          grid: {
            color: "#ebedef",
          },
        },
      },
    };

    setLineOptions(lineOptions);
  };

  const applyDarkTheme = () => {
    const lineOptions = {
      plugins: {
        legend: {
          labels: {
            color: "#ebedef",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#ebedef",
          },
          grid: {
            color: "rgba(160, 167, 181, .3)",
          },
        },
        y: {
          ticks: {
            color: "#ebedef",
          },
          grid: {
            color: "rgba(160, 167, 181, .3)",
          },
        },
      },
    };

    setLineOptions(lineOptions);
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
    onValue(query(usersRef, orderByChild('role')), (snapshot) => {
      console.log({ snapshot });

      setUsers([])
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val() as UserType;
        setUsers((prevValue) => [
          ...prevValue, userData
        ])

      })
    });
  }, [])

  useEffect(() => {
    onValue(query(tipsOlahragaRef), (snapshot) => {
      setTips([])

      snapshot.forEach((item) => {
        console.log(item.val());
        const data = item.val() as TipsType;
        setTips((prevData) => [...prevData, data])

      });
    });
  }, [])

  useEffect(() => {
    onValue(query(tipsMakananRef), (snapshot) => {
      // setTips([])

      snapshot.forEach((item) => {
        console.log(item.val());
        const data = item.val() as TipsType;
        setTips((prevData) => [...prevData, data])

      });
    });
  }, [])

  useEffect(() => {
    onValue(query(resepNormalRef), (snapshot) => {
      setReseps([])
      snapshot.forEach((item) => {
        console.log(item.val());
        const data = item.val() as ResepType;
        setReseps((prevData) => [...prevData, data])
      })
    });
  }, [])


  useEffect(() => {
    if (layoutConfig.colorScheme === "light") {
      applyLightTheme();
    } else {
      applyDarkTheme();
    }
  }, [layoutConfig.colorScheme]);

  const formatCurrency = (value: number) => {
    return value?.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  return (
    <div className="grid">
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">Data Pengguna</span>
              <div className="text-900 font-medium text-xl">{users.length} orang</div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-blue-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-users text-blue-500 text-xl" />
            </div>
          </div>
          {/* <span className="text-green-500 font-medium">24 new </span> */}
          <span className="text-500">since last record</span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">Video Tips</span>
              <div className="text-900 font-medium text-xl">{tips.length} video</div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-orange-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-youtube text-orange-500 text-xl" />
            </div>
          </div>
          {/* <span className="text-green-500 font-medium">%52+ </span> */}
          <span className="text-500">video olahraga dan makanan</span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">Data Resep</span>
              <div className="text-900 font-medium text-xl">{reseps.length} resep</div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-cyan-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-bookmark text-cyan-500 text-xl" />
            </div>
          </div>
          {/* <span className="text-green-500 font-medium">520 </span> */}
          <span className="text-500">resep normal dan obesitas</span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">Data Jadwal</span>
              <div className="text-900 font-medium text-xl">52 Jadwal</div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-purple-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-calendar text-purple-500 text-xl" />
            </div>
          </div>
          {/* <span className="text-green-500 font-medium">85 </span> */}
          <span className="text-500">jadwal normal dan obesitas</span>
        </div>
      </div>

      <div className="col-12 xl:col-6">
        <div className="card">
          <div className="flex justify-content-between align-items-center mb-5">
            <h5>Tingkat Keberhasilan Program</h5>
            <div>
              <Button
                type="button"
                icon="pi pi-ellipsis-v"
                className="p-button-rounded p-button-text p-button-plain"
                onClick={(event) => menu1.current?.toggle(event)}
              />
              <Menu
                ref={menu1}
                popup
                model={[
                  { label: "Add New", icon: "pi pi-fw pi-plus" },
                  { label: "Remove", icon: "pi pi-fw pi-minus" },
                ]}
              />
            </div>
          </div>
          <ul className="list-none p-0 m-0">
            {
              users.map((user, index) => {
                const randomNumber = getRandomInt(100)
                return <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4" key={index}>
                  <div>
                    <span className="text-900 font-medium mr-2 mb-1 md:mb-0">
                      {user.nama}
                    </span>
                    <div className="mt-1 text-600">{user.status}</div>
                  </div>
                  <div className="mt-2 md:mt-0 flex align-items-center">
                    <div
                      className="surface-300 border-round overflow-hidden w-10rem lg:w-6rem"
                      style={{ height: "8px" }}
                    >
                      <div
                        className="bg-purple-500 h-full"
                        style={{ width: `${randomNumber}%` }}
                      />
                    </div>
                    <span className="text-purple-500 ml-3 font-medium">%{randomNumber}</span>
                  </div>
                </li>
              })
            }

          </ul>
        </div>
      </div>

      <div className="col-12 xl:col-6">
        <div className="card">
          <h5>Data Pengguna</h5>
          <Chart type="line" data={lineData} options={lineOptions} />
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
