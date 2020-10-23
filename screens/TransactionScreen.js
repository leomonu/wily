import React,{Component} from 'react';
import {View,Text,StyleSheet,TouchableOpacity,TextInput,Image, Alert,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
import db from '../config';
import * as firebase from 'firebase';

export default class TransactionScreen extends React.Component{
constructor(){
    super();
    this.state = {
        hasCameraPermissions:null,
        scanned :false,
        scannedData:'',
        buttonState:'normal',
        scannedBookID:'',
        scannedStudentID:'',

    }
}
getCameraPermissions= async(id)=>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
        hasCameraPermissions:status === "granted",
        buttonState:id,
        scanned:false,

    })
}
handleBarcodeScanned =async({type,data})=>{
    
    if(this.state.buttonState === 'BookId'){
        this.setState({
            scanned:true,
            scannedBookID:data,
            buttonState:'normal',
        })
    }
    else if(this.state.buttonState === 'StudentId'){
        this.setState({
            scanned:true,
            scannedStudentID:data,
            buttonState:'normal',
        })
    }
    
}
initiateBookIssue = async()=>{
    db.collection('transactions').add({
        studentId:this.state.scannedStudentID,
        bookId:this.state.scannedBookID,
        transactionType:'Issue',

    })
    db.collection('books').doc(this.state.scannedBookID).update({
        bookAvailability:false
    })
    db.collection('students').doc(this.state.scannedStudentID).update({
        numberOfBooksIssued:firebase.firestore.FieldValue.increment(1),   
     })
     Alert.alert('Book Issued')
     this.setState({
         scannedBookID:'',
         scannedStudentID:'',
     })
    }
    initiateBookReturn = async()=>{
        db.collection('transactions').add({
            studentId:this.state.scannedStudentID,
            bookId:this.state.scannedBookID,
            transactionType:'Return',
    
        })
        db.collection('books').doc(this.state.scannedBookID).update({
            bookAvailability:true
        })
        db.collection('students').doc(this.state.scannedStudentID).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1),   
         })
         Alert.alert('Book Returned')
         this.setState({
             scannedBookID:'',
             scannedStudentID:'',
         })
        }
handleTranscation = ()=>{
    var transactionMessage;
    db.collection('books').doc(this.state.scannedBookID).get()
    .then((doc)=>{
        console.log(doc.data())
        var book = doc.data();
        if(book.bookAvailability === true){
            this.initiateBookIssue();
            transactionMessage = 'Book Issued'
            ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
        }
        else {
            this.initiateBookReturn();
            transactionMessage  = 'Book Returned'
            ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
        }
    })
}
render(){
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState  = this.state.buttonState

    if(buttonState !== 'normal' && hasCameraPermissions){
        return(
            <BarCodeScanner onBarCodeScanned = {scanned?undefined: this.handleBarcodeScanned} 
            style = {StyleSheet.absoluteFillObject}/>
        )
    }
    else if (buttonState === 'normal'){
    return(
        <KeyboardAvoidingView style = {styles.container} behavior='padding'enabled>
        <View style= {styles.container}>
            <View>
                <Image source={require('../assets/booklogo.jpg')} style={{
                    width:200,
                    height:200,
                }}/>
            </View>
            
            <View style = {styles.inputView}>
                <TextInput style = {styles.inputBox} placeholder  = 'Book ID' value = {this.state.scannedBookID} onChangeText  = {(t)=>{
                    this.setState({
                        scannedBookID:t
                    })
                }}/>
                <TouchableOpacity style = {styles.scanButton} onPress = {
                    ()=>{
                        this.getCameraPermissions('BookId')
                    }
                }>
                    <Text style = {styles.buttonText}>Scan</Text>
                </TouchableOpacity>
            </View>
            
            <View style = {styles.inputView}>
            <TextInput style = {styles.inputBox} placeholder  = 'Student ID' value = {this.state.scannedStudentID} onChangeText = {(t)=>{
                this.setState({
                    scannedStudentID:t
                })
            }}/>
                <TouchableOpacity style = {styles.scanButton} onPress = {
                    ()=>{
                        this.getCameraPermissions('StudentId')
                    }}> 
                
                    <Text style = {styles.buttonText}>Scan</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style = {styles.submitButton} onPress = {()=>{
                this.handleTranscation();
            }
            }>
                <Text style = {styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>

    )
        }
}

}
const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    displayText:{
        fontSize:15,
        textDecorationLine:'underline'
    },
    scan:{
       backgroundColor:'#2196f3',
       padding:10,
       margin:10 
    },
    buttonText:{
        fontSize:15, 
        textAlign:'center',
        marginTop:10,

    },
    inputView:{
        flexDirection:'row',
        margin:20,
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    scanButton:{
        backgroundColor:'#66bb6a',
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0,
    },
    submitButton:{
        backgroundColor:'#fbc02d',
        width:100,
        height:50,
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:'bold',
        color:'white',
    }


})