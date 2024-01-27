'use client'
import { onValue, orderByChild, query, ref, set } from 'firebase/database';
import React, { useEffect, useRef, useState } from 'react'
import { database, nutrisisRef } from '../../../lib/firebase';
import { NutrisiType } from '../../../types/nutrisi';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import ReactAudioPlayer from 'react-audio-player';
import { Dialog } from 'primereact/dialog';
import { classNames } from 'primereact/utils';
import DropZone from '../tolak-ukur/dropzone';

// import DynamicQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic'

const DynamicQuill = dynamic(() => import('react-quill'), { ssr: false })


const emptyNutrisi: NutrisiType = {
    id: 0,
    title: '',
    image: '',
    definisi: '',
    kebutuhan: '',
    dianjurkan: '',
    dibatasi: '',
    dihindari: '',
    definisiSound: '',
    kebutuhanSound: '',
    dianjurkanSound: '',
    dibatasiSound: '',
    dihindariSound: ''
}

export default function NutrisiPage() {
    const [nutrisis, setNutrisis] = useState<NutrisiType[]>([])
    const [nutrisi, setNutrisi] = useState<NutrisiType>(emptyNutrisi);

    const dt = useRef<DataTable<NutrisiType[]>>(null);
    const toast = useRef<Toast>(null);

    const [nutrisiDialog, setNutrisiDialog] = useState(false);
    const [deleteNutrisiDialog, setDeleteNutrisiDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    const [file, setFile] = useState<File>()

    const [isPlaying, setIsPlaying] = useState(false);
    const [status, setStatus] = useState('create');

    const [value, setValue] = useState('');


    useEffect(() => {
        onValue(query(nutrisisRef, orderByChild('id')), (snapshot) => {
            console.log({ snapshot });

            setNutrisis([])
            snapshot.forEach((childSnapshot) => {
                const nutrisiData = childSnapshot.val() as NutrisiType;
                setNutrisis((prevValue) => [
                    ...prevValue, nutrisiData
                ])

            })
        });
    }, [])

    const openNew = () => {
        setNutrisi(emptyNutrisi);
        setStatus('create')
        setSubmitted(false);
        setNutrisiDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setNutrisiDialog(false);
    };

    const hideDeleteNutrisiDialog = () => {
        setDeleteNutrisiDialog(false);
    };

    const saveNutrisi = () => {
        setSubmitted(true);
        console.log({ status });
        console.log({ nutrisi });
        console.log({ value });
        console.log({ file });

        set(ref(database, 'nutrisis/' + nutrisi.title), nutrisi)
            .then(() => {
                toast.current?.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Data Updated",
                    life: 3000,
                });
                setNutrisiDialog(false)
                setNutrisi(emptyNutrisi)
            })


    }

    const editNutrisi = (nutrisi: NutrisiType) => {
        setStatus('update')
        setNutrisi({ ...nutrisi });
        setNutrisiDialog(true);
    };

    const confirmDeleteNutrisi = (nutrisi: NutrisiType) => {
        setNutrisi(nutrisi);
        setDeleteNutrisiDialog(true);
    };

    const deleteNutrisi = () => {
        console.log({ nutrisi });

    };

    const exportCSV = () => {
        dt.current?.exportCSV();
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
                    onClick={exportCSV}
                />
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData: NutrisiType) => {
        return (
            <>
                <Button
                    icon="pi pi-pencil"
                    rounded
                    severity="success"
                    className="mr-2"
                    onClick={() => editNutrisi(rowData)}
                />
                <Button
                    disabled
                    icon="pi pi-trash"
                    rounded
                    severity="warning"
                    onClick={() => confirmDeleteNutrisi(rowData)}
                />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Nutrisis</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                    placeholder="Search..."
                />
            </span>
        </div>
    );

    const nutrisiDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveNutrisi} />
        </>
    );
    const deleteNutrisiDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                text
                onClick={hideDeleteNutrisiDialog}
            />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteNutrisi} />
        </>
    );


    const handleNutrisiChange = (field: keyof NutrisiType, value: string) => {
        setNutrisi((prevNutrisi) => ({
            ...prevNutrisi,
            [field]: value,
        }));
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">

                    <Toast ref={toast} />
                    <Toolbar
                        className="mb-4"
                        // left={leftToolbarTemplate}
                        right={rightToolbarTemplate}
                    />

                    <DataTable
                        ref={dt}
                        value={nutrisis}
                        dataKey="id"
                        paginator
                        rows={20}
                        rowsPerPageOptions={[20, 40, 60, 80, 100]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} nutrisis"
                        globalFilter={globalFilter}
                        emptyMessage="No nutrisis found."
                        scrollable
                        header={header}
                        responsiveLayout="scroll"
                    >

                        <Column field="id" header="#" style={{ width: "5%" }} className="" />
                        <Column
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: "10rem" }}
                        ></Column>
                        <Column sortable field="title" header="Judul" style={{ width: "20%" }} className="font-bold" />
                        <Column
                            field="definisi"
                            header="Definisi"
                            body={(data: NutrisiType) => {
                                return (
                                    <div>
                                        <p>
                                            {data.definisi}
                                        </p>
                                        <ReactAudioPlayer
                                            src={data.definisiSound} // Update the path to your MP3 file
                                            autoPlay={isPlaying}
                                            controls
                                        />
                                    </div>
                                )
                            }}
                        />
                        <Column
                            field="kebutuhan"
                            header="Kebutuhan"
                            body={(data: NutrisiType) => {
                                return (
                                    <div className=''>
                                        <p>
                                            {data.kebutuhan}
                                        </p>
                                        <ReactAudioPlayer
                                            src={data.kebutuhan} // Update the path to your MP3 file
                                            autoPlay={isPlaying}
                                            controls
                                        />
                                    </div>
                                )
                            }}
                        />
                        <Column
                            field="dianjurkan"
                            header="Dianjurkan"
                            body={(data: NutrisiType) => {
                                return (
                                    <div className=''>
                                        <p>
                                            {data.dianjurkan}
                                        </p>
                                        <ReactAudioPlayer
                                            src={data.dianjurkanSound} // Update the path to your MP3 file
                                            autoPlay={isPlaying}
                                            controls
                                        />
                                    </div>
                                )
                            }}
                        />
                        <Column
                            field="dibatasi"
                            header="Dibatasi"
                            body={(data: NutrisiType) => {
                                return (
                                    <div className=''>
                                        <p>
                                            {data.dibatasi}
                                        </p>
                                        <ReactAudioPlayer
                                            src={data.dibatasiSound} // Update the path to your MP3 file
                                            autoPlay={isPlaying}
                                            controls
                                        />
                                    </div>
                                )
                            }}
                        />
                        <Column
                            field="dihindari"
                            header="Dihindari"
                            body={(data: NutrisiType) => {
                                return (
                                    <div className=''>
                                        <p>
                                            {data.dihindari}
                                        </p>
                                        <ReactAudioPlayer
                                            src={data.dihindariSound} // Update the path to your MP3 file
                                            autoPlay={isPlaying}
                                            controls
                                        />
                                    </div>
                                )
                            }}
                        />



                    </DataTable>

                    <Dialog
                        visible={nutrisiDialog}
                        style={{ width: "75vw" }}
                        header="Tambah Soal"
                        modal
                        className="p-fluid"
                        footer={nutrisiDialogFooter}
                        onHide={hideDialog}
                        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
                    >

                        {/* <div className="field">
                            <label htmlFor="soal">Soal nutrisi ukur</label>
                            <InputText
                                id="soal"
                                name="soal"
                                value={nutrisi.definisi}
                                onChange={(e) => setNutrisi({ ...nutrisi, definisi: e.target.value })}
                                required
                                autoFocus
                                className={classNames({
                                    "p-invalid": submitted && !nutrisi.definisi,
                                })}
                            />
                            {submitted && !nutrisi.definisi && (
                                <small className="p-invalid p-error">Definisi is required.</small>
                            )}
                        </div> */}


                        <div className="field">
                            <label htmlFor="">Definisi</label>
                            <DynamicQuill theme="snow" value={nutrisi.definisi} onChange={(e) => handleNutrisiChange('definisi', e)} />
                            <DropZone file={file!} setFile={setFile} />
                        </div>
                        <div className="field">
                            <label htmlFor="">Dianjurkan</label>
                            <DynamicQuill theme="snow" value={nutrisi.dianjurkan} onChange={(e) => handleNutrisiChange('dianjurkan', e)} />
                            <DropZone file={file!} setFile={setFile} />
                        </div>
                        <div className="field">
                            <label htmlFor="">Dibatasi</label>
                            <DynamicQuill theme="snow" value={nutrisi.dibatasi} onChange={(e) => handleNutrisiChange('dibatasi', e)} />
                            <DropZone file={file!} setFile={setFile} />
                        </div>
                        <div className="field">
                            <label htmlFor="">Dihindari</label>
                            <DynamicQuill theme="snow" value={nutrisi.dihindari} onChange={(e) => handleNutrisiChange('dihindari', e)} />
                            <DropZone file={file!} setFile={setFile} />
                        </div>
                        <div className="field">
                            <label htmlFor="">Kebutuhan</label>
                            <DynamicQuill theme="snow" value={nutrisi.kebutuhan} onChange={(e) => handleNutrisiChange('kebutuhan', e)} />
                            <DropZone file={file!} setFile={setFile} />
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteNutrisiDialog}
                        style={{ width: "450px" }}
                        header="Confirm"
                        modal
                        footer={deleteNutrisiDialogFooter}
                        onHide={hideDeleteNutrisiDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: "2rem" }}
                            />
                            {nutrisi && (
                                <span>
                                    Are you sure you want to delete <b>{nutrisi.id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                </div>
            </div>
        </div>
    )
}
