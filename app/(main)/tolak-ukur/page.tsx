'use client'
import { onValue, orderByChild, query, set, ref as refDatabase, remove } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { TolakUkurType } from "../../../types/TolakUkurType";
import { database, storage, tolaksRef } from "../../../lib/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import ReactAudioPlayer from "react-audio-player";
import DropZone from "./dropzone";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const emptyTolak: TolakUkurType = {}
export default function TolakUkurPage() {
  const [tolaks, setTolaks] = useState<TolakUkurType[]>([])
  const [tolak, setTolak] = useState<TolakUkurType>(emptyTolak);
  const [tolakDialog, setTolakDialog] = useState(false);
  const [deleteTolakDialog, setDeleteTolakDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<TolakUkurType[]>>(null);

  const [file, setFile] = useState<File | undefined>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('create');

  useEffect(() => {
    onValue(query(tolaksRef, orderByChild('role')), (snapshot) => {
      console.log({ snapshot });

      setTolaks([])
      snapshot.forEach((childSnapshot) => {
        const tolakData = childSnapshot.val() as TolakUkurType;
        setTolaks((prevValue) => [
          ...prevValue, tolakData
        ])

      })
    });
  }, [])

  const openNew = () => {
    setTolak(emptyTolak);
    setStatus('create')
    setSubmitted(false);
    setTolakDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setTolakDialog(false);
  };

  const hideDeleteTolakDialog = () => {
    setDeleteTolakDialog(false);
  };

  const saveTolak = () => {
    setSubmitted(true);
    console.log({ status });
    console.log({ tolak });
    console.log({ file });

    const lastIndex = tolaks[tolaks.length - 1]
    const tolakId = status === 'create' ? Number(lastIndex.id) + 1 : tolak.id
    console.log(tolakId);

    if (tolak.soal?.trim()) {
      // setTolaks(_tolaks);

      let fileName = tolak.sound

      if (file === undefined) {
        console.log('undefined');
        if (status === 'create') {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "please select a audio file",
            life: 3000,
          });
          return
        } else {
          set(refDatabase(database, 'tolak-ukurs/' + tolakId), {
            id: tolakId,
            soal: tolak.soal,
            sound: tolak.sound,
            jawabans: [
              { id: 1, title: "Ya" },
              { id: 2, title: "Tidak" }
            ]
          });

          toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Data Updated",
            life: 3000,
          });

          setTolakDialog(false);
          setTolak(emptyTolak);
          setFile(undefined)
        }
      } else {
        console.log('not undefined');

        const storageRef = ref(storage, `tolak-ukur/${file!.name}`)
        const uploadTask = uploadBytesResumable(storageRef, file!)

        uploadTask.on("state_changed",

          (snapshot) => {
            const progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log({ progress });
          },
          (error) => {
            console.log({ error });
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
              console.log({ downloadUrl })
              set(refDatabase(database, 'tolak-ukurs/' + tolakId), {
                id: tolakId,
                soal: tolak.soal,
                sound: downloadUrl,
                jawabans: [
                  { id: 1, title: "Ya" },
                  { id: 2, title: "Tidak" }
                ]
              });

              toast.current?.show({
                severity: "success",
                summary: "Successful",
                detail: "Data Submited",
                life: 3000,
              });

              setTolakDialog(false);
              setTolak(emptyTolak);
              setFile(undefined)

            })


          }
        )

      }


    }



  }

  const editTolak = (tolak: TolakUkurType) => {
    setStatus('update')
    setTolak({ ...tolak });
    setTolakDialog(true);
  };

  const confirmDeleteTolak = (tolak: TolakUkurType) => {
    setTolak(tolak);
    setDeleteTolakDialog(true);
  };

  const deleteTolak = () => {
    console.log({ tolak });
    remove(refDatabase(database, "tolak-ukurs/" + tolak.id))
      .then(() => {
        setDeleteTolakDialog(false);
        setTolak(emptyTolak);
        toast.current?.show({
          severity: "success",
          summary: "Successful",
          detail: "Tolak Deleted",
          life: 3000,
        });
      })


  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = (e.target && e.target.value) || "";
    setTolak({ ...tolak, [e.target.name]: val });
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

  const actionBodyTemplate = (rowData: TolakUkurType) => {
    return (
      <>
        <Button
          icon="pi pi-pencil"
          rounded
          severity="success"
          className="mr-2"
          onClick={() => editTolak(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          severity="warning"
          onClick={() => confirmDeleteTolak(rowData)}
        />
      </>
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Manage Tolaks</h5>
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

  const tolakDialogFooter = (
    <>
      <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" text onClick={saveTolak} />
    </>
  );
  const deleteTolakDialogFooter = (
    <>
      <Button
        label="No"
        icon="pi pi-times"
        text
        onClick={hideDeleteTolakDialog}
      />
      <Button label="Yes" icon="pi pi-check" text onClick={deleteTolak} />
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
            value={tolaks}
            dataKey="id"
            paginator
            rows={20}
            rowsPerPageOptions={[20, 40, 60, 80, 100]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tolaks"
            globalFilter={globalFilter}
            emptyMessage="No tolaks found."
            scrollable
            header={header}
            responsiveLayout="scroll"
          >

            <Column field="id" header="#" style={{ width: "5%" }} frozen className="" />
            <Column sortable frozen field="soal" header="Soal" style={{ width: "30%" }} className="font-bold" />
            <Column
              field="sound"
              header="audio"
              body={(data: TolakUkurType) => {
                return (
                  <div>

                    <ReactAudioPlayer
                      src={data.sound} // Update the path to your MP3 file
                      autoPlay={isPlaying}
                      controls
                    />
                  </div>
                )
              }}
            />

            <Column
              body={actionBodyTemplate}
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
          </DataTable>

          <Dialog
            visible={tolakDialog}
            style={{ width: "450px" }}
            header="Tambah Soal"
            modal
            className="p-fluid"
            footer={tolakDialogFooter}
            onHide={hideDialog}
          >

            <div className="field">
              <label htmlFor="soal">Soal tolak ukur</label>
              <InputText
                id="soal"
                name="soal"
                value={tolak.soal}
                onChange={(e) => setTolak({ ...tolak, soal: e.target.value })}
                required
                autoFocus
                className={classNames({
                  "p-invalid": submitted && !tolak.soal,
                })}
              />
              {submitted && !tolak.soal && (
                <small className="p-invalid p-error">Soal is required.</small>
              )}
            </div>
            <div className="field">
              <DropZone file={file!} setFile={setFile} />
            </div>
          </Dialog>


          <Dialog
            visible={deleteTolakDialog}
            style={{ width: "450px" }}
            header="Confirm"
            modal
            footer={deleteTolakDialogFooter}
            onHide={hideDeleteTolakDialog}
          >
            <div className="flex align-items-center justify-content-center">
              <i
                className="pi pi-exclamation-triangle mr-3"
                style={{ fontSize: "2rem" }}
              />
              {tolak && (
                <span>
                  Are you sure you want to delete <b>{tolak.id}</b>?
                </span>
              )}
            </div>
          </Dialog>

        </div>
      </div>
    </div>
  );
}


