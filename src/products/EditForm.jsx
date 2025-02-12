import { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Typography, Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { collection, updateDoc, getDocs, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase-config";
import Swal from "sweetalert2";
import { useAppStore } from "../appStore";
import { MEASURE_UNIT, SALE_TYPE } from "../Constants";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

// import uuid from 'uuid/package.json';
const { v4: uuidv4 } = require('uuid');

export default function EditForm({ fid, closeEvent }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("")
  const [file, setFile] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const empCollectionRef = collection(db, "Menu");
  const setRows = useAppStore((state) => state.setRows);
  const rows = useAppStore((state) => state.rows);
  console.log(rows)
  const [percent, setPercent] = useState(0);
  const [measureUnit, setMeasureUnit] = useState("")
  const [quantity, setQuantity] = useState("")
  const [onSale, setOnSale] = useState(fid.onSale)
  const [saleType, setSaleType] = useState(fid.saleType);
  const [saleValue, setSaleValue] = useState(fid.saleValue);
  const [settingsData, setSettingsData] = useState({})
  const settingsDataRef = collection(db, "Settings");

  useEffect(() => {
    console.log("FID: " + fid.id);
    setName(fid.name);
    setDescription(fid.description)
    setPrice(fid.price);
    setCategory(fid.category);
    setMeasureUnit(fid.measureUnit);
    setQuantity(fid.quantity);
    setSubCategory(fid.subCategory)
  }, []);

  useEffect(() => {
    getSettingsData()
  }, [])
  console.log("SELECTED _ CATEGORY ", category, subCategory)
  const getSettingsData = async () => {
    const data = await getDocs(settingsDataRef)
    data.docs.map((doc)=> {
      setSettingsData({...doc.data(), id: doc.id})
    })
  }
  const getUsers = async () => {
    const data = await getDocs(empCollectionRef);
    setRows(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  console.log("SETTINGS DATA", settingsData)
  const createUser = async () => {
    const userDoc = doc(db, "Menu", fid.id);
    const newFields = {
      // id: doc.id,
      name: name,
      description: description,
      price: Number(price),
      subCategory: subCategory,
      category: category,
    };
    console.log(newFields, "NEWWWWWWWWWWWW FIELD")
    await updateDoc(userDoc, newFields);
    getUsers();
    closeEvent();
    Swal.fire("Submitted!", "Your file has been updated.", "success");
  };

  const createUserWithFile = async (url) => {
    const userDoc = doc(db, "Menu", fid.id);
    const newFields = {
      id: doc.id,
      name: name,
      description: description,
      price: Number(price),
      subCategory: subCategory,
      category: category,
      file: url,
    };
    await updateDoc(userDoc, newFields);
    getUsers();
    closeEvent();
    Swal.fire("Submitted!", "Your file has been updated.", "success");
  };

  const handleUpload = () => {
    if (!file) {
      createUser();
    } else {
      // const name = new Date().getTime() + file.name
      const storageRef = ref(storage, `/images/${file.name + uuidv4()}`);

      // progress can be paused and resumed. It also exposes progress updates.
      // Receives the storage reference and the file to upload.
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );

          // update progress
          setPercent(percent);
        },
        (err) => console.log(err),
        () => {
          // download url
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            console.log(url);
            createUserWithFile(url);
          });
        }
      );
    }
  };

  const handleSaleTypeChange = (event) => {
    setSaleType(event.target.value)
  }
  const handleSaleValueChange = (event) => {
    setSaleValue(event.target.value)
  }
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }
  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };
  const handleSetQuantity = (event) => {
    setQuantity(event.target.value)
  }
  const handleChangeUnit = (event) => {
    setMeasureUnit(event.target.value)
  }
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handlePicChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubCategoryChange = (event) => {
    setSubCategory(event.target.value);
  };
  const handleChangeOnSale = (event) => {
    setOnSale(event.target.checked)
  }
  return (
    <div>
      <Box sx={{ m: 2 }} />
      <Typography variant="h5" align="center">
        Edit Product
      </Typography>
      <IconButton
        style={{ position: "absolute", top: "0", right: "0" }}
        onClick={closeEvent}
      >
        <CloseIcon />
      </IconButton>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            error={false}
            id="name"
            name="name"
            value={name}
            onChange={handleNameChange}
            label="Name"
            size="small"
            sx={{ marginTop: "30px", minWidth: "100%" }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            error={false}
            id="description"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            label="Description"
            size="small"
            sx={{ marginTop: "30px", minWidth: "100%" }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            error={false}
            id="price"
            label="Price"
            type="number"
            value={price}
            onChange={handlePriceChange}
            size="small"
            sx={{ minWidth: "100%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupeeIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={0.8}>
          <FormControlLabel
            control={<Checkbox checked={onSale} onChange={handleChangeOnSale} name="onSale" />}
            name="onSale"
            sx={{ minWidth: "100%" }}
            label="Sale" />
        </Grid>
        <Grid item xs={2.6}>
          {onSale &&
            <TextField
              error={false}
              id="saleType"
              label="SaleType"
              select
              name='saleType'
              value={saleType}
              onChange={handleSaleTypeChange}
              size="small"
              sx={{ minWidth: "100%" }}
            >
              {SALE_TYPE.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          }
        </Grid>
        <Grid item xs={2.6}>
          {onSale &&
            <TextField
              error={false}
              id="SaleValue"
              name="saleValue"
              type="number"
              value={saleValue}
              onChange={handleSaleValueChange}
              label="Sale Value"
              size="small"
              sx={{ minWidth: "100%" }}
            />}
        </Grid>
        <Grid item xs={3}>
          <TextField
            error={false}
            id="category"
            label="Category"
            select
            value={category}
            onChange={handleCategoryChange}
            size="small"
            sx={{ minWidth: "100%" }}
          >
            {settingsData["categories"] && Object.keys(settingsData["categories"]).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField
            error={false}
            id="subCategory"
            label="Sub Category"
            select
            value={subCategory}
            onChange={handleSubCategoryChange}
            size="small"
            sx={{ minWidth: "100%" }}
          >
            {settingsData["categories"] && settingsData["categories"][category]?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField
            error={false}
            id="measureUnit"
            label="Unit"
            select
            name="measureUnit"
            value={measureUnit}
            onChange={handleChangeUnit}
            size="small"
            sx={{ minWidth: "100%" }}
          >
            {MEASURE_UNIT.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField
            error={false}
            id="quantity"
            label="Quantity"
            type="number"
            name='quantity'
            value={quantity}
            onChange={handleSetQuantity}
            size="small"
            sx={{ minWidth: "100%" }}
          />
        </Grid>
        <Grid item xs={12}>
          <input type="file" onChange={handlePicChange} accept="/image/*" />
          <p>{percent}% completed</p>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" align="center">
            <Button variant="contained" onClick={handleUpload}>
              Submit
            </Button>
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
}
