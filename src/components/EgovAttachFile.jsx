import React from 'react';
import { useNavigate} from 'react-router-dom';

import URL from 'constants/url';
import * as EgovNet from 'api/egovFetch';
import { SERVER_URL } from 'config';
import CODE from 'constants/code';

function EgovAttachFile({ boardFiles, mode, fnChangeFile, fnDeleteFile, posblAtchFileNumber }) {
    console.groupCollapsed("EgovAttachFile");

    // posblAtchFileNumber는 수정일 경우에만 값이 넘어오므로 방어 로직
	// 해당 컴포넌트는 스케줄 화면과 공유하며, 스케줄에서는 첨부파일을 1개 넣을 수 있으므로 디폴트 값을 1로 설정
    if(typeof posblAtchFileNumber == "undefined" || posblAtchFileNumber == null) {
        posblAtchFileNumber = 1;
    }

	const navigate = useNavigate();

    function onClickDownFile(atchFileId, fileSn) {
        window.open(SERVER_URL + "/cmm/fms/FileDown.do?atchFileId=" + atchFileId + "&fileSn=" + fileSn + "");
    }

    function onClickDeleteFile(atchFileId, fileSn, fileIndex) {
        console.log("onClickDeleteFile Params : ", atchFileId, fileSn, fileIndex);

		const jToken = localStorage.getItem('jToken');
        
        const requestOptions = {
            method: "DELETE",
            headers: {
				'Authorization': jToken
            },
            body: {
                "atchFileId" : atchFileId,
                "fileSn" : fileSn
            }
        }
        EgovNet.requestFetch(`/cmm/fms/deleteFileInfsAPI/${atchFileId}/${fileSn}.do`,
            requestOptions,
            function (resp) {
                console.log("===>>> board file delete= " , resp);
                if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
                    // 성공
                    console.log("Deleted fileIndex = " , fileIndex);
					// eslint-disable-next-line no-unused-vars
                    const _deleteFile = boardFiles.splice(fileIndex, 1);
                    const _boardFiles = Object.assign([], boardFiles);
                    fnDeleteFile(_boardFiles);
                    alert("첨부파일이 삭제되었습니다.");
                    fnChangeFile({});
                } else {
                    navigate({pathname: URL.ERROR}, {state: {msg : resp.resultMessage}});
                }
            }
        );
    }

    function onChangeFileInput(e) {
        console.log("===>>> e = " + e.target.files[0]);
        fnChangeFile(e.target.files[0]);
    }

    let filesTag = [];

    if (boardFiles !== undefined) {
        boardFiles.forEach(function (item, index) {
            filesTag.push(
                <React.Fragment key={index}>
                    <span>
                        <a  href={"#LINK"} onClick={function (e) {
                            e.preventDefault();
                            onClickDownFile(item.atchFileId, item.fileSn);
                        }} download>
                            {item.orignlFileNm}
                        </a>
                        <span>
                            [{item.fileMg}byte]
                        </span>
                    </span>
                </React.Fragment>
            );

            if (mode === CODE.MODE_MODIFY) {
                filesTag.push(
                    <React.Fragment key={["button", `${index}`].join(" ")}>
                        <button className="btn btn_delete" onClick={(e) => {
                            onClickDeleteFile(item.atchFileId, item.fileSn, index);
                        }}></button>
                    </React.Fragment>
                );
            }
            filesTag.push(<br key={["br", `${index}`].join(" ")}/>);
        });
    }
    console.log("filesTag : ", filesTag);
    console.groupEnd("EgovAttachFile");

    return (
        <dl>
            <dt>첨부파일</dt>
            <dd>
                <span className="file_attach">
                    {filesTag}
                    {(mode === CODE.MODE_CREATE) && <input name="file_0" id="egovComFileUploader" type="file" onChange={e => onChangeFileInput(e)}></input>}
                    {/* 첨부파일 1개 당  filesTag는 3개 요소(span, button, br)를 가진다 */}
                    {(mode === CODE.MODE_MODIFY && (filesTag.length/3 < posblAtchFileNumber)) && <input name="file_0" id="egovComFileUploader" type="file" onChange={e => onChangeFileInput(e)}></input>}
                </span>
            </dd>
        </dl>
    );
}

export default React.memo(EgovAttachFile);