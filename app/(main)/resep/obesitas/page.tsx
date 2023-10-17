'use client'
import { onValue, query, ref, remove, set } from 'firebase/database';
import React, { useEffect, useRef, useState } from 'react'
import { database, resepNormalRef, resepObesitasRef } from '../../../../lib/firebase';
import { ResepType } from '../../../../types/resep';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import YouTube from "react-youtube"
import { Dialog } from 'primereact/dialog';
import { classNames } from 'primereact/utils';
import ReactQuill from 'react-quill';

const emptyResep: ResepType = {
    bahan: '', cara: '', id: 0, image: '', title: '', uid: ''
}
export default function ResepObesitasPage() {

    const [reseps, setReseps] = useState<ResepType[]>([])
    const [resep, setResep] = useState<ResepType>(emptyResep)

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<ResepType[]>>(null);

    const [deleteResepDialog, setDeleteResepDialog] = useState(false);
    const [resepDialog, setResepDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const opts = {
        height: "200",
        width: "300",
        // width: "100%",
        playerVars: {
            autoplay: 0,
        },
    };

    useEffect(() => {
        onValue(query(resepObesitasRef), (snapshot) => {
            setReseps([])
            snapshot.forEach((item) => {
                console.log(item.val());
                const data = item.val() as ResepType;
                setReseps((prevData) => [...prevData, data])
            })
        });
    }, [])

    const openNew = () => {
        setResep(emptyResep)
        setSubmitted(false);
        setResepDialog(true);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button
                        label="New"
                        icon="pi pi-plus"
                        severity="success"
                        className=" mr-2"
                        onClick={openNew}
                    />

                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload
                    mode="basic"
                    accept="image/*"
                    maxFileSize={1000000}
                    chooseLabel="Import"
                    className="mr-2 inline-block"
                />
                <Button
                    label="Export"
                    icon="pi pi-upload"
                    severity="help"
                //   onClick={exportCSV}
                />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Data Resep Normal</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    //   onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                    placeholder="Search..."
                />
            </span>
        </div>
    );

    const editResep = (resep: ResepType) => {
        setResep(resep);
        setResepDialog(true);
    };

    const confirmDeleteResep = (resep: ResepType) => {
        setResep(resep);
        setDeleteResepDialog(true);
    };

    const actionBodyTemplate = (rowData: ResepType) => {
        return (
            <>
                <Button
                    icon="pi pi-pencil"
                    rounded
                    severity="success"
                    className="mr-2"
                    onClick={() => editResep(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    severity="warning"
                    onClick={() => confirmDeleteResep(rowData)}
                />
            </>
        );
    };

    const hideDialog = () => {
        setSubmitted(false);
        setResepDialog(false);
    };

    const saveResep = () => {
        setSubmitted(true);
        console.log({ resep });

        const uid = resep.title.replace(" ", "_")
        console.log({ uid });


        // console.log({ tip });
        set(ref(database, 'reseps/resepobesitas/' + uid), {
            uid: uid,
            bahan: resep.bahan,
            cara: resep.cara,
            image: resep.image,
            title: resep.title,
        })
            .then(() => {
                toast.current?.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Data Created",
                    life: 3000,
                });

                setResepDialog(false);
                setResep(emptyResep);
            })
    }

    const resepDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveResep} />
        </>
    );

    const hideDeleteResepDialog = () => {
        setDeleteResepDialog(false);
    };

    const deleteResep = () => {
        console.log({ resep });

        remove(ref(database, 'reseps/resepobesitas/' + resep.uid))
            .then(() => {
                setDeleteResepDialog(false);
                setResep(emptyResep);
                toast.current?.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Data Deleted",
                    life: 3000,
                });
            })

    };

    const deleteResepDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                text
                onClick={hideDeleteResepDialog}
            />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteResep} />
        </>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar
                        className="mb-4"
                        left={leftToolbarTemplate}
                        right={rightToolbarTemplate}
                    ></Toolbar>

                    <DataTable
                        ref={dt}
                        value={reseps}
                        dataKey="id"
                        paginator
                        rows={20}
                        rowsPerPageOptions={[20, 40, 60, 80, 100]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tolaks"
                        // globalFilter={globalFilter}
                        emptyMessage="No tolaks found."
                        scrollable
                        header={header}
                        responsiveLayout="scroll"
                    >

                        {/* <Column field="id" header="#" style={{ width: "5%" }} frozen className="" /> */}
                        <Column sortable frozen field="title" header="Judul Resep" style={{ width: "20%" }} className="font-bold" />
                        <Column
                            field="image"
                            header="Gambar"
                            body={(data: ResepType) => {
                                return (
                                    <div>
                                        <img
                                            src={data.image}
                                            alt={data.title}
                                            className=""
                                            height={100}
                                        />
                                    </div>
                                )
                            }}
                        />
                        <Column
                            field="cara"
                            header="Tutorial"
                            body={(data: ResepType) => {
                                return (
                                    <div>
                                        <YouTube videoId={data.cara} className="w-full h-full"
                                            opts={opts} />
                                    </div>
                                )
                            }}
                        />
                        <Column field="bahan" header="Bahan-Bahan" style={{ width: "60%" }} className="" />


                        <Column
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: "10rem" }}
                        ></Column>
                    </DataTable>


                    <Dialog
                        visible={resepDialog}
                        style={{ width: "75vw" }}
                        header="Form Resep"
                        modal
                        className="p-fluid"
                        footer={resepDialogFooter}
                        onHide={hideDialog}
                        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
                    >
                        <div className="field">
                            <p className="font-bold">Petunjuk Video ID</p>
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
                            <label htmlFor="soal">Video ID Tutorial</label>
                            <InputText
                                id="soal"
                                name="soal"
                                value={resep.cara}
                                onChange={(e) => setResep({ ...resep, cara: e.target.value })}
                                required
                                autoFocus
                                className={classNames({
                                    "p-invalid": submitted && !resep.cara,
                                })}
                            />
                            {submitted && !resep.cara && (
                                <small className="p-invalid p-error">Video ID tutorial is required.</small>
                            )}
                        </div>
                        <div className="field">
                            <label htmlFor="soal">Judul Tutorial</label>
                            <InputText
                                id="soal"
                                name="soal"
                                value={resep.title}
                                onChange={(e) => setResep({ ...resep, title: e.target.value })}
                                required
                                // autoFocus
                                className={classNames({
                                    "p-invalid": submitted && !resep.title,
                                })}
                            />
                            {submitted && !resep.title && (
                                <small className="p-invalid p-error">field is required.</small>
                            )}
                        </div>
                        <div className="field">
                            <label htmlFor="soal">Thumbnail Image Link</label>
                            <InputText
                                id="image"
                                name="image"
                                value={resep.image}
                                onChange={(e) => setResep({ ...resep, image: e.target.value })}
                                required
                                // autoFocus
                                className={classNames({
                                    "p-invalid": submitted && !resep.image,
                                })}
                            />
                            {submitted && !resep.image && (
                                <small className="p-invalid p-error">field is required.</small>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="soal">Bahan-Bahan Tutorial</label>
                            <ReactQuill theme="snow" value={resep.bahan} onChange={(e) => setResep({ ...resep, bahan: e })} />
                        </div>

                    </Dialog>

                    <Dialog
                        visible={deleteResepDialog}
                        style={{ width: "450px" }}
                        header="Confirm"
                        modal
                        footer={deleteResepDialogFooter}
                        onHide={hideDeleteResepDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: "2rem" }}
                            />
                            {resep && (
                                <span>
                                    Are you sure you want to delete <b>{resep.title}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                </div>
            </div>
        </div>
    )
}
