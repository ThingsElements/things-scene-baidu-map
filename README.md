# BAIDU MAP 컴포넌트
## 두 개의 컴포넌트
* baidu-map : 맵을 그리는 컴포넌트 (google-map 컴포넌트와 속성 동일)
* bmap-marker : 바이두맵에 마커를 표시하는 컴포넌트 (gmap-marker 컴포넌트와 속성 동일)
## 관련 컴포넌트
* infowindow
 * bmap-marker 의 hover, tap 이벤트에 연결된 경우, 바이두맵에서 클릭하거나 hover 될 때, 바이두맵의 인포윈도우가 보이게 됨
## Known Issues
* 바이두맵 컴포넌트를 사용할 때 관련된 스타일이 자동 설치되나, things-scene-viewer 컴포넌트 내부에 있는 바이두맵 엘리먼트들에 적용되지 못함. 대표적으로 바이두맵의 인포윈도우에 스타일 적용이 안됨.
* 구글맵과 바이두맵의 위도/경도 마커의 위치에 일정한 차이가 있음. 원인은 아직 잘 모름. 이 경우는 바이두맵 서비스와 우리 컴포넌트와도 차이가 있는지 확인이 필요함.
## 설치
* nodejs, npm 을 최신버전으로 설치할 것을 권장함.
```
$ rm yarn.lock
$ yarn install
```
## 실행 (개발중)
```
$ yarn serve:dev
```
* 브라우저(Chrome, ~~Safari~~, ~~Firefox~~, Opera)를 열어서 접속
```
http://0.0.0.0:3000
```
* 서비스포트를 바꾸고 싶다면,..
```
$ yarn serve:dev -p 3001
```
## 빌드 (개발 완료시)
```
$ yarn build
$ yarn serve
```
## 배포
* npm 리파지토리에 배포하는 것을 의미함.
* 배포 과정중에 버전업 합니다.
```
$ yarn publish
```
## 커밋
* github에 업로드하는 것을 의미함.
## 참조
* Things Shell [https://github.com/hatiolab/things-shell]
* Things Shell Demo [https://github.com/hatiolab/things-shell-demo]
* Things Yeoman Generator [https://github.com/hatiolab/generator-things]
