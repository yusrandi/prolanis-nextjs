'use client'
import { onValue, orderByChild, query } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import { usersRef } from "../../../lib/firebase";
import { UserType } from "../../../types/UserType";
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


const emptyUser: UserType = {
  id: "",
  berat: 0,
  jk: "",
  nama: "",
  pekerjaan: "",
  penyakit: "",
  role: "USER",
  status: "normal",
  telepon: "",
  tinggi: 0,
  usia: "",
  email: ""
};
export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [user, setUser] = useState<UserType>(emptyUser);
  const [userDialog, setUserDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<UserType[]>>(null);


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

  const openNew = () => {
    setUser(emptyUser);
    setSubmitted(false);
    setUserDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setUserDialog(false);
  };

  const hideDeleteUserDialog = () => {
    setDeleteUserDialog(false);
  };

  const saveUser = () => {
    setSubmitted(true);
    console.log({ user });
    if (user.nama?.trim()) {
      // setUsers(_users);
      setUserDialog(false);
      setUser(emptyUser);
    }



  }

  const editUser = (user: UserType) => {

    setUser({ ...user });
    setUserDialog(true);
  };

  const confirmDeleteUser = (user: UserType) => {
    setUser(user);
    setDeleteUserDialog(true);
  };

  const deleteUser = () => {
    setDeleteUserDialog(false);
    setUser(emptyUser);
    toast.current?.show({
      severity: "success",
      summary: "Successful",
      detail: "User Deleted",
      life: 3000,
    });
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = (e.target && e.target.value) || "";
    setUser({ ...user, [e.target.name]: val });
  };

  const onCategoryChange = (e: RadioButtonChangeEvent) => {
    // let _user = { ...user };
    // e.target.name = e.value;
    setUser({ ...user, role: e.value });
  };

  const onInputNumberChange = (
    e: InputNumberValueChangeEvent
  ) => {
    const val = e.value || 0;
    let _user = { ...user };
    e.target.name = val.toString();

    setUser(_user);
  };

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <div className="my-2">
          <Button
            disabled
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

  const actionBodyTemplate = (rowData: UserType) => {
    return (
      <>
        <Button
          disabled
          icon="pi pi-pencil"
          rounded
          severity="success"
          className="mr-2"
          onClick={() => editUser(rowData)}
        />
        <Button
          disabled
          icon="pi pi-trash"
          rounded
          severity="warning"
          onClick={() => confirmDeleteUser(rowData)}
        />
      </>
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Manage Users</h5>
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

  const userDialogFooter = (
    <>
      <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" text onClick={saveUser} />
    </>
  );
  const deleteUserDialogFooter = (
    <>
      <Button
        label="No"
        icon="pi pi-times"
        text
        onClick={hideDeleteUserDialog}
      />
      <Button label="Yes" icon="pi pi-check" text onClick={deleteUser} />
    </>
  );
  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar
            className="mb-4"
            // left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          ></Toolbar>
          <DataTable
            ref={dt}
            value={users}
            dataKey="id"
            paginator
            rows={20}
            rowsPerPageOptions={[20, 40, 60, 80, 100]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
            globalFilter={globalFilter}
            emptyMessage="No users found."
            scrollable
            header={header}
            responsiveLayout="scroll"
          >

            {/* <Column field="id" header="#" style={{ width: "5%" }} frozen className="" /> */}
            <Column sortable frozen field="nama" header="Nama Lengkap" style={{ width: "30%" }} className="font-bold" />
            <Column sortable field="role" header="Hak Akses" style={{}} frozen className="" />
            <Column sortable field="jk" header="Jenis Kelamin" style={{}} frozen className="" />
            <Column field="pekerjaan" header="Pekerjaan" style={{}} frozen className="" />
            <Column
              field="usia"
              header="Umur"
              sortable
              style={{ width: "5%" }}
              body={(data: UserType) => `${data.usia} th`}
            />
            <Column
              field="tinggi"
              header="TB (cm)"
              sortable
              style={{ width: "5%" }}
              body={(data: UserType) => `${data.tinggi} cm`}
            />
            <Column
              field="berat"
              header="BB (kg)"
              sortable
              style={{ width: "5%" }}
              body={(data: UserType) => `${data.berat} kg`}
            />
            <Column field="status" header="Status" style={{}} frozen className="" />
            <Column field="penyakit" header="Penyakit Diderita" style={{}} frozen className="" />

            {/* <Column
              body={actionBodyTemplate}
              headerStyle={{ minWidth: "10rem" }}
            ></Column> */}
          </DataTable>

          <Dialog
            visible={userDialog}
            style={{ width: "450px" }}
            header="User Details"
            modal
            className="p-fluid"
            footer={userDialogFooter}
            onHide={hideDialog}
          >

            <div className="field">
              <label htmlFor="nama">Name</label>
              <InputText
                id="nama"
                name="nama"
                value={user.nama}
                onChange={(e) => onInputChange(e)}
                required
                autoFocus
                className={classNames({
                  "p-invalid": submitted && !user.nama,
                })}
              />
              {submitted && !user.nama && (
                <small className="p-invalid p-error">Name is required.</small>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <InputText
                id="email"
                name="email"
                value={user.email}
                onChange={(e) => onInputChange(e)}
                required
                inputMode="email"
                // autoFocus
                className={classNames({
                  "p-invalid": submitted && !user.email,
                })}
              />
              {submitted && !user.email && (
                <small className="p-invalid p-error">Email is required.</small>
              )}
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <InputTextarea
                id="description"
                name="pekerjaan"
                value={user.pekerjaan}
                onChange={(e) => onInputChange(e)}
                required
                rows={3}
                cols={20}
                className={classNames({
                  "p-invalid": submitted && !user.pekerjaan,
                })}
              />
              {submitted && !user.pekerjaan && (
                <small className="p-invalid p-error">Job is required.</small>
              )}
            </div>

            <div className="field">
              <label className="mb-3">ROLE</label>
              <div className="formgrid grid">
                <div className="field-radiobutton col-6">
                  <RadioButton
                    inputId="category1"
                    name="role"
                    value="USER"
                    onChange={onCategoryChange}
                    checked={user.role === "USER"}
                  />
                  <label htmlFor="category1">USER</label>
                </div>
                <div className="field-radiobutton col-6">
                  <RadioButton
                    inputId="category2"
                    name="role"
                    value="DOKTER"
                    onChange={onCategoryChange}
                    checked={user.role === "DOKTER"}
                  />
                  <label htmlFor="category2">DOKTER</label>
                </div>
                <div className="field-radiobutton col-6">
                  <RadioButton
                    inputId="category3"
                    name="role"
                    value="AHLI"
                    onChange={onCategoryChange}
                    checked={user.role === "AHLI"}
                  />
                  <label htmlFor="category3">AHLI</label>
                </div>

              </div>
            </div>

            <div className="formgrid grid">
              <div className="field col">
                <label htmlFor="price">Berat(kg)</label>
                <InputNumber
                  id="price"
                  value={user.berat}
                  onValueChange={(e) => onInputNumberChange(e)}
                  suffix=" kg"
                />
              </div>
              <div className="field col">
                <label htmlFor="quantity">Tinggi(cm)</label>
                <InputNumber
                  id="quantity"
                  value={user.tinggi}
                  onValueChange={(e) => onInputNumberChange(e)}
                  suffix=" cm"
                />
              </div>
            </div>
          </Dialog>


          <Dialog
            visible={deleteUserDialog}
            style={{ width: "450px" }}
            header="Confirm"
            modal
            footer={deleteUserDialogFooter}
            onHide={hideDeleteUserDialog}
          >
            <div className="flex align-items-center justify-content-center">
              <i
                className="pi pi-exclamation-triangle mr-3"
                style={{ fontSize: "2rem" }}
              />
              {user && (
                <span>
                  Are you sure you want to delete <b>{user.nama}</b>?
                </span>
              )}
            </div>
          </Dialog>

        </div>
      </div>
    </div>
  );
}


