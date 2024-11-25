import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {PickersDay, StaticDatePicker} from '@mui/x-date-pickers';
import { DateCalendar } from '@mui/x-date-pickers';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import dayjs from 'dayjs';
import ko from 'dayjs/locale/ko';
import {useEffect, useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {Badge, TextField} from "@mui/material"
import "./Calendar.scss"
import Note from './Note';
import {
    postAllVolunteerCall, postAssignmentCancel,
    postCallVolunteer,
    postUserVolunteerCall, postVolunteerAssignment,
    putEditUserData
} from "../services/apiServices";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {MdDeleteForever, MdEdit} from "react-icons/md";

dayjs.locale('ko');

const Calendar = () => {
    const [called, setCalled] = useState(false);

    //리듁스에서 꺼내오기
    const userInfo = useSelector(state => state.user.account)
    const isAuthenticated = useSelector(state => state.user.isAuthenticated)

    const navigate = useNavigate();

    const [newValue, setValue] = useState(dayjs())
    const [showModal, setShowModal] = useState(false);
    const [note, setNote] = useState("")
    const [noteList, setNoteList] = useState([ //예약 list
        { noteName : "홍길동", noteDate: "2024-11-05", noteContent: "1st note", noteEmail: "1234@naver.com" },
        { noteName : "정희원", noteDate: "2024-11-08", noteContent: "2nd note", noteEmail: "5678@naver.com" },
    ]);
    const [secondNoteList, setSecondNoteList] = useState([ //출장 list
        { noteName : "환자", noteDate: "2024-11-05", noteContent: "2nd note", noteName2 : "봉사자", noteEmail: "", noteEmail2: "", notePhone: ""}
    ]);
    const [view, setView] = useState('day');

    const [date, setDate] = useState(new Date()); // 현재 날짜를 기본값으로 설정

    const handleDateChange = (newDate) => {
        const today = dayjs(); // 오늘 날짜를 가져옴
        setValue(today);
    };

    
    const handleAddEvent = () => {
        setShowModal(true);
    };
    const handleClose = () => {
        setShowModal(false);
    };

    //봉사 확정
    const handleAssignmentAction = async (index) => {
        try {
            const note = noteList[index];
            console.log(userInfo.email, note.noteEmail, note.noteDate, note.noteContent);

            const data = await postVolunteerAssignment(userInfo.email, note.noteEmail, note.noteDate, note.noteContent);
            console.log('Check response', data);

            // 성공적으로 API 호출이 완료되면 noteList에서 항목 제거하고 secondNoteList에 추가
            setNoteList(prev => prev.filter((_, i) => i !== index));
            setSecondNoteList(prev => [
                ...prev,
                { ...note, noteName2: userInfo.username, noteEmail2: userInfo.email } // 봉사자 정보 추가
            ]);

            alert("봉사 확정이 완료되었습니다.");
        } catch (error) {
            alert("서버 문제로 봉사확정이 실패했습니다.");
        }
    };

    //봉사 취소하기
    const handleCancelAction = async (index) => {
        try {
            const note = secondNoteList[index];
            console.log('front data :', note.noteEmail2, note.noteEmail, note.noteDate, note.noteContent);

            const data = await postAssignmentCancel(note.noteEmail2, note.noteEmail, note.noteDate, note.noteContent);
            console.log('Check response', data);

            // 성공적으로 API 호출이 완료되면 secondNoteList에서 항목 제거하고 noteList에 추가
            setSecondNoteList(prev => prev.filter((_, i) => i !== index));
            setNoteList(prev => [
                ...prev,
                { ...note, noteName: note.noteName, noteEmail: note.noteEmail } // 환자 정보 유지
            ]);

            alert("봉사 취소가 완료되었습니다.");
        } catch (error) {
            alert("서버 문제로 봉사취소가 실패했습니다.");
        }
    };

    //예약 list 작성
    const handleSubmit = async (e) => {
        if (note.trim()) {
            const newNote = {
                noteName : userInfo?.username,
                noteDate: newValue.format('YYYY-MM-DD'),
                noteContent: note,
                noteEmail : userInfo?.email
            };
            console.log('email: ', userInfo?.email, 'name: ', userInfo?.username, ' noteDate: ', newNote.noteDate, 'noteContent', newNote.noteContent)
            try {
                const data = await postCallVolunteer(userInfo?.email, newNote.noteDate, newNote.noteContent);
                console.log('Check response', data)

                setNoteList(prev => [...prev, newNote]);
                setNote("");
                setShowModal(false);
            } catch (error) {
                alert("서버에서 작성 후 저장에 실패했습니다.")

            }

        } else {
            alert("내용을 입력해주세요.");
        }
    };
    //봉사자 기준 받아오기
    const allVolunteerCall = async () => {
        try {
            const data = await postAllVolunteerCall(userInfo?.email);
            console.log('Check response', data);

            // 두 가지 리스트로 데이터를 분리
            const desiredVolunteerDates = data.desiredVolunteerDates.map(item => ({
                noteDate: item.desireddate,
                noteContent: item.text,
                noteName: item.app_user?.name,
                noteEmail: item.userid
            }));

            const volunteerAssignments = data.volunteerAssignments.map(item => ({
                noteDate: item.assignmentdate,
                noteContent: item.text,
                noteName: item.userByUserid?.name, //환자 이름
                noteEmail: item.userByUserid?.userid,
                noteName2: item.userByVolunteerId?.name, //봉사자 이름
                noteEmail2: item.userByVolunteerId?.userid,
                notePhone: item.userByUserid?.phone_num
            }));

            setNoteList(desiredVolunteerDates);
            setSecondNoteList(volunteerAssignments);
            console.log('Transformed typeA data:', desiredVolunteerDates);
            console.log('Transformed typeB data:', volunteerAssignments);

        } catch (error) {
            alert("서버에서 예약list, 출장list를 받아오는데 실패했습니다.");
        }
    };
    //환자 기준 받아오기
    const userVolunteerCall = async () => {
        try {
            const data = await postUserVolunteerCall(userInfo?.email);
            console.log('Check response', data);

            // 두 가지 리스트로 데이터를 분리
            const desiredVolunteerDates = data.desiredVolunteerDates.map(item => ({
                noteDate: item.desireddate,
                noteContent: item.text,
                noteName: item.app_user?.name,
                noteEmail: item.userid
            }));

            const volunteerAssignments = data.volunteerAssignments.map(item => ({
                noteDate: item.assignmentdate,
                noteContent: item.text,
                noteName: item.userByUserid?.name, //환자 이름
                noteEmail: item.userByUserid?.userid,
                noteName2: item.userByVolunteerId?.name, //봉사자 이름
                noteEmail2: item.userByVolunteerId?.userid,
                notePhone: item.userByVolunteerId?.phone_num
            }));

            setNoteList(desiredVolunteerDates);
            setSecondNoteList(volunteerAssignments);
            console.log('Transformed typeA data:', desiredVolunteerDates);
            console.log('Transformed typeB data:', volunteerAssignments);
        } catch (error) {
            alert("서버에서 예약list, 출장list를 받아오는데 실패했습니다.");
        }
    };

    //화면 들어왔을 때
    useEffect(() => {
        if (userInfo && userInfo.role && !called) {
            if (userInfo.role === "Patient" || userInfo.role === "user") {
                userVolunteerCall();
            } else {
                allVolunteerCall();
            }
            setCalled(true); // 첫 호출 후에 called를 true로 설정하여 이후 호출 방지
        } else {
/*            alert("로그인 후 이용하세요");
            navigate('/');*/
        }
    }, [userInfo.role, called]);


    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="ko"
        >
            <div className="container">

                <Row className="g-4" style={{ width: '100%' }}>
                    {/* 캘린더 열: 2/4 비율 (md=4) */}
                    <Col className="calendar-container border bg-body" style={{ flexGrow: 5}}>
                        <div style={{ padding: '10px', width: '100%', margin: '0 auto' }}>
                            <div className="calendar-toolbar">
                                <strong>{newValue.format('YYYY년 MM월 DD일')}</strong>
                            </div>

                            <DateCalendar
                                value={newValue}
                                onChange={(newValue) => setValue(newValue)}
                                disablePast
                                views={['year', 'month', 'day']}
                                view={view}
                                onViewChange={(newView) => setView(newView)}
                                locale="ko"
                                sx={{
                                    maxWidth: '100%', // 최대 너비를 부모 컨테이너에 맞춤
                                    width: '300px', // 기본 너비 설정
                                    margin: '0 auto', // 중앙 정렬
                                    '& .MuiPickersCalendarHeader-root': {
                                        backgroundColor: '#00bcd4', // 헤더 색상
                                        color: '#fff',
                                    },
                                }}
                            />

                            <div className="calendar-action-bar">
                                <button className="action-button today-button" onClick={handleDateChange}>
                                    오늘
                                </button>
                                {userInfo.role === "Patient" && (
                                    <>
                                        <button className="action-button confirm-button" onClick={handleAddEvent}>
                                            추가
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Col>

                    {/* 첫 번째 Note 열: 1/4 비율 (md=4) */}
                    <Col className="note-container" style={{ flexGrow: 4}}>
                        <Note
                            noteList={noteList}
                            setNoteList={setNoteList}
                            newValue={newValue}
                            note={note}
                            setNote={setNote}
                            isFirstList={true}
                            handleAssignmentAction={handleAssignmentAction}
                            handleCancelAction={handleCancelAction}
                        />
                    </Col>

                    {/* 두 번째 Note 열: 1/4 비율 (md=4) */}
                    <Col className="second-note-container" style={{ flexGrow: 4}}>
                        <Note
                            noteList={secondNoteList}
                            setNoteList={setSecondNoteList}
                            newValue={newValue}
                            note={note}
                            setNote={setNote}
                            isFirstList={false}
                            handleCancelAction={handleCancelAction}
                        />
                    </Col>
                </Row>


                <Modal show={showModal} onHide={handleClose} style={{minHeight: '300px'}}>
                    <Modal.Header closeButton>
                        <Modal.Title>{newValue.format('YYYY년 MM월 DD일')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{minHeight: '200px'}}>
                        <TextField
                            label="내용을 입력해주세요"
                            fullWidth
                            multiline
                            value={note} type="text"
                            onChange={e => setNote(e.target.value)}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => {handleSubmit()}}>
                            추가
                        </Button>
                        <Button variant="secondary" onClick={handleClose}>
                            취소
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>

        </LocalizationProvider>
    )
}
export default Calendar