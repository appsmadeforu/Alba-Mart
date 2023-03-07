import React, { useState } from 'react'
import map from "lodash/map";
import isNull from "lodash/isNull";
import { Box, IconButton, Typography, Button } from '@mui/material'
import CloseIcon from "@mui/icons-material/Close";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddProductRow from './resuable/AddProductRow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Swal from "sweetalert2";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase-config";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useAppStore } from '../appStore';

const { v4: uuidv4 } = require('uuid');

function AddProducts({ closeEvent }) {
    const [products, setProducts] = useState([]);
    const [rows, setRows] = useState([1]);
    const [percent, setPercent] = useState(0)
    const [productUrl, setProductUrl] = useState([]);
    const [isUrlLoaded, setIsUrlLoaded] = useState(false);
    const dataRef = collection(db, "Menu");
    const setData = useAppStore((state) => state.setRows);

    const getUsers = async () => {
        const data = await getDocs(dataRef);
        setData(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    const addItem = async (prod,urls) => {
        console.log(urls, "I am inside addItem()")
        await addDoc(dataRef, {
            id: uuidv4(),
            name: prod["name"],
            description: prod["description"],
            price: Number(prod["price"]),
            onSale: prod["onSale"],
            saleType: prod["saleType"],
            saleValue: prod["saleValue"],
            category: prod["category"],
            subCategory: prod["subCategory"],
            measureUnit: prod["measureUnit"],
            quantity: prod["quantity"],
            file: prod["url"],
            date: String(new Date())
        });
        getUsers();
        closeEvent();
        Swal.fire("Submitted!", "Your file has been submitted.", "success");
    }

    const handleUpload = () => {
        const files = map(products, "file")
        if (files.every(isNull)) {
            Swal.fire("Failed!", "Please upload an image first!", "error");
        } else {
            Object.values(products).map((prod) => {
                console.log(prod, "Mein hu product");
                prod["url"] = []
                Object.values(prod.file).forEach(async file => {
                    const storageRef = ref(storage, `/images/${uuidv4()+ file.name}`)
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
                            getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
                                console.log([...productUrl, url], "Download URL");
                               setProductUrl([...productUrl, url])
                            });
                        }
                    );
                    const url = await storageRef.getDownloadURL();
                    console.log(url, "new url download")
                })
                addItem(prod,productUrl)
            })
            console.log(productUrl, "end");
            // Object.values(products).forEach(prod => addItem(prod));
        }
    }
    return (
        <>
            <Box sx={{ width: 'auto' }}>
                <Typography variant='h5' align='center'>
                    Add Multiple Products
                </Typography>
                <IconButton style={{ position: 'absolute', top: '0', right: '0' }} onClick={closeEvent}>
                    <CloseIcon />
                </IconButton>
                {percent != 0 && <p>{percent}% completed</p>}
                {rows.map((index) => (
                    <Card sx={{ marginTop: "25px", border: "1px solid" }} key={`ADDPRODUCT-${index}`}>
                        <CardHeader action={
                            <IconButton aria-label="close" onClick={() => {
                                const i = rows.indexOf(index)
                                const prods = { ...products }
                                const newRows = [...rows]
                                if (i > -1) {
                                    newRows.splice(i, 1)
                                    delete prods[`${index}-Row`]
                                }
                                setProducts(prods)
                                setRows(newRows)
                            }}>
                                <CloseIcon />
                            </IconButton>
                        } />
                        <CardContent>
                            <AddProductRow key={index * 2} index={`${index}-Row`} setProducts={setProducts} products={products} />
                        </CardContent>
                    </Card>
                ))}
                <IconButton onClick={() =>
                    setRows([...rows, rows.length ? rows[rows.length - 1] + 1 : 1])
                } style={{ display: 'block', margin: '15px auto 0' }}>
                    <AddCircleIcon />
                </IconButton>
                <Typography variant="h5" align="right">
                    <Button variant="contained" style={{ width: '200px', marginRight: '25px' }} onClick={handleUpload}>
                        Submit
                    </Button>
                </Typography>
            </Box>
        </>
    )
}

export default AddProducts