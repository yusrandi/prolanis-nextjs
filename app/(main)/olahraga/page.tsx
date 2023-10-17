"use client";
import React, { useState, useEffect, useRef } from "react";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Rating } from "primereact/rating";
import { PickList } from "primereact/picklist";
import { OrderList } from "primereact/orderlist";
import { InputText } from "primereact/inputtext";
import { Demo, LayoutType, SortOrderType } from "../../../types/demo";
import { ProductService } from "../../../demo/service/ProductService";
import { onValue, query, ref, remove, set } from "firebase/database";
import { database, tipsMakananRef, tipsOlahragaRef } from "../../../lib/firebase";
import { TipsType } from "../../../types/TipsType";
import YouTube from "react-youtube"
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

export default function OlahragaPage() {
    const listValue = [
        { name: "San Francisco", code: "SF" },
        { name: "London", code: "LDN" },
        { name: "Paris", code: "PRS" },
        { name: "Istanbul", code: "IST" },
        { name: "Berlin", code: "BRL" },
        { name: "Barcelona", code: "BRC" },
        { name: "Rome", code: "RM" },
    ];

    const [dataViewValue, setDataViewValue] = useState<Demo.Product[]>([]);
    const [filteredValue, setFilteredValue] = useState<Demo.Product[]>([]);

    const [tips, setTips] = useState<TipsType[]>([])
    const [tip, setTip] = useState<TipsType>({ id: '', video: '' })

    const [deleteTipsDialog, setDeleteTipsDialog] = useState(false);
    const [tipsDialog, setTipsDialog] = useState(false);

    const toast = useRef<Toast>(null);

    const [submitted, setSubmitted] = useState(false);




    const opts = {
        height: "250",
        width: "100%",
        playerVars: {
            autoplay: 0,
        },
    };

    useEffect(() => {
        ProductService.getProducts().then((data) => {
            setDataViewValue(data);
            setFilteredValue(data);
        });
    }, []);

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

    const openNew = () => {
        setTip({ id: '', video: '' });
        setSubmitted(false);
        setTipsDialog(true);
    };

    const hideDeleteTipsDialog = () => {
        setDeleteTipsDialog(false);
    };

    const deleteTips = () => {
        console.log({ tip });
        remove(ref(database, "tips/Olahraga/" + tip.id))
            .then(() => {
                setDeleteTipsDialog(false);
                setTip({ id: '', video: '' });
                toast.current?.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Tips Deleted",
                    life: 3000,
                });
            })
    };

    const confirmDeleteTips = (tip: TipsType) => {
        setTip(tip);
        setDeleteTipsDialog(true);
    };

    const deleteTipsDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                text
                onClick={hideDeleteTipsDialog}
            />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteTips} />
        </>
    );

    const dataviewGridItem = (data: Demo.Product) => {
        return (
            <div className="col-12 lg:col-6">
                <div className="card m-3 border-1 surface-border">
                    <div className="flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
                        <div className="flex align-items-center">
                            <i className="pi pi-tag mr-2" />
                            <span className="font-semibold">{data.category}</span>
                        </div>
                        <span
                            className={`product-badge status-${data.inventoryStatus?.toLowerCase()}`}
                        >
                            {data.inventoryStatus}
                        </span>
                    </div>
                    <div className="flex flex-column align-items-center text-center mb-3">
                        <img
                            src={`/demo/images/product/${data.image}`}
                            alt={data.name}
                            className="w-9 shadow-2 my-3 mx-0"
                        />
                        <div className="text-2xl font-bold">{data.name}</div>
                        <div className="mb-3">{data.description}</div>
                        <Rating value={data.rating} readOnly cancel={false} />
                    </div>
                    <div className="flex align-items-center justify-content-between">
                        <span className="text-2xl font-semibold">${data.price}</span>
                        <Button
                            icon="pi pi-shopping-cart"
                            disabled={data.inventoryStatus === "OUTOFSTOCK"}
                        />
                    </div>
                </div>
            </div>
        );
    };

    function dataTipsItem(data: TipsType) {
        return (
            <div className="col-12 lg:col-6">
                <div className="card m-3 border-1 surface-border">


                    <div className="flex flex-column align-items-center text-center mb-3">
                        <YouTube videoId={data.video} className="w-full h-full"
                            opts={opts} />
                    </div>
                    <div className="flex align-items-center justify-content-between">
                        {/* <span className="text-2xl font-semibold">{data.video}</span> */}
                        <Button
                            onClick={() => confirmDeleteTips(data)}
                            severity="danger"
                            icon="pi pi-trash"
                        />
                    </div>
                </div>
            </div>
        );
    }

    const hideDialog = () => {
        setSubmitted(false);
        setTipsDialog(false);
    };

    const saveTips = () => {
        setSubmitted(true);
        console.log({ tip });
        set(ref(database, 'tips/Olahraga/' + tip.video), {
            id: tip.video,
            video: tip.video
        })
            .then(() => {
                toast.current?.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Data Created",
                    life: 3000,
                });

                setTipsDialog(false);
                setTip({ id: '', video: '' });
            })
    }

    const tipsDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveTips} />
        </>
    );

    return (
        <div className="grid list-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <div className="my-2 mx-2 flex align-items-center justify-content-between">
                        <h5>Data Tips dan Trik Video Olahraga</h5>
                        <Button
                            label="New"
                            icon="pi pi-plus"
                            severity="success"
                            className="ml-auto"
                            onClick={openNew}
                        />

                    </div>
                    <DataView
                        value={tips}
                        paginator
                        rows={10}
                        itemTemplate={dataTipsItem}
                    // header={dataViewHeader}
                    ></DataView>


                    <Dialog
                        visible={tipsDialog}
                        style={{ width: "450px" }}
                        header="Tambah Soal"
                        modal
                        className="p-fluid"
                        footer={tipsDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <p className="font-bold">Petunjuk</p>
                            <p>ID video akan terletak dalam URL halaman video, tepat setelah parameter URL v=</p>
                            <p>Dalam kasus ini, URL video adalah: https://www.youtube.com/watch?v=aqz-KE-bpKQ. Oleh karena itu, ID video dari video tersebut adalah aqz-KE-bpKQ.</p>
                        </div>

                        <div className="field">
                            <img
                                src={`https://camo.githubusercontent.com/78e1ba6715553b6712b68ebbb3f520ddfa0b5e7c24801dd9901a5c3ba1d8211f/687474703a2f2f692e696d6775722e636f6d2f4f6c776b3463722e706e67`}
                                alt={'video id'}
                                className="w-9 shadow-2 my-3 mx-0"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="soal">Video ID</label>
                            <InputText
                                id="soal"
                                name="soal"
                                value={tip.video}
                                onChange={(e) => setTip({ ...tip, video: e.target.value })}
                                required
                                autoFocus
                                className={classNames({
                                    "p-invalid": submitted && !tip.video,
                                })}
                            />
                            {submitted && !tip.video && (
                                <small className="p-invalid p-error">Video ID is required.</small>
                            )}
                        </div>

                    </Dialog>

                    <Dialog
                        visible={deleteTipsDialog}
                        style={{ width: "450px" }}
                        header="Confirm"
                        modal
                        footer={deleteTipsDialogFooter}
                        onHide={hideDeleteTipsDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: "2rem" }}
                            />
                            {tip && (
                                <span>
                                    Are you sure you want to delete <b>{tip?.id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                </div>
            </div>
        </div>
    );
}

