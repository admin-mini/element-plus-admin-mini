function Y(V,j){var q=V;function y(d,t){return d<<t|d>>>32-t}function o(d,t){var c,i,b,l,u;return b=d&2147483648,l=t&2147483648,c=d&1073741824,i=t&1073741824,u=(d&1073741823)+(t&1073741823),c&i?u^2147483648^b^l:c|i?u&1073741824?u^3221225472^b^l:u^1073741824^b^l:u^b^l}function E(d,t,c){return d&t|~d&c}function J(d,t,c){return d&c|t&~c}function K(d,t,c){return d^t^c}function Q(d,t,c){return t^(d|~c)}function v(d,t,c,i,b,l,u){return d=o(d,o(o(E(t,c,i),b),u)),o(y(d,l),t)}function S(d,t,c,i,b,l,u){return d=o(d,o(o(J(t,c,i),b),u)),o(y(d,l),t)}function s(d,t,c,i,b,l,u){return d=o(d,o(o(K(t,c,i),b),u)),o(y(d,l),t)}function W(d,t,c,i,b,l,u){return d=o(d,o(o(Q(t,c,i),b),u)),o(y(d,l),t)}function X(d){for(var t,c=d.length,i=c+8,b=(i-i%64)/64,l=(b+1)*16,u=Array(l-1),R=0,A=0;A<c;)t=(A-A%4)/4,R=A%4*8,u[t]=u[t]|d.charCodeAt(A)<<R,A++;return t=(A-A%4)/4,R=A%4*8,u[t]=u[t]|128<<R,u[l-2]=c<<3,u[l-1]=c>>>29,u}function g(d){var t="",c="",i,b;for(b=0;b<=3;b++)i=d>>>b*8&255,c="0"+i.toString(16),t=t+c.substr(c.length-2,2);return t}var n=Array(),a,k,w,P,U,x,e,f,r,C=7,m=12,H=17,h=22,p=5,B=9,T=14,D=20,F=4,G=11,I=16,M=23,N=6,O=10,_=15,L=21;for(n=X(q),x=1732584193,e=4023233417,f=2562383102,r=271733878,a=0;a<n.length;a+=16)k=x,w=e,P=f,U=r,x=v(x,e,f,r,n[a+0],C,3614090360),r=v(r,x,e,f,n[a+1],m,3905402710),f=v(f,r,x,e,n[a+2],H,606105819),e=v(e,f,r,x,n[a+3],h,3250441966),x=v(x,e,f,r,n[a+4],C,4118548399),r=v(r,x,e,f,n[a+5],m,1200080426),f=v(f,r,x,e,n[a+6],H,2821735955),e=v(e,f,r,x,n[a+7],h,4249261313),x=v(x,e,f,r,n[a+8],C,1770035416),r=v(r,x,e,f,n[a+9],m,2336552879),f=v(f,r,x,e,n[a+10],H,4294925233),e=v(e,f,r,x,n[a+11],h,2304563134),x=v(x,e,f,r,n[a+12],C,1804603682),r=v(r,x,e,f,n[a+13],m,4254626195),f=v(f,r,x,e,n[a+14],H,2792965006),e=v(e,f,r,x,n[a+15],h,1236535329),x=S(x,e,f,r,n[a+1],p,4129170786),r=S(r,x,e,f,n[a+6],B,3225465664),f=S(f,r,x,e,n[a+11],T,643717713),e=S(e,f,r,x,n[a+0],D,3921069994),x=S(x,e,f,r,n[a+5],p,3593408605),r=S(r,x,e,f,n[a+10],B,38016083),f=S(f,r,x,e,n[a+15],T,3634488961),e=S(e,f,r,x,n[a+4],D,3889429448),x=S(x,e,f,r,n[a+9],p,568446438),r=S(r,x,e,f,n[a+14],B,3275163606),f=S(f,r,x,e,n[a+3],T,4107603335),e=S(e,f,r,x,n[a+8],D,1163531501),x=S(x,e,f,r,n[a+13],p,2850285829),r=S(r,x,e,f,n[a+2],B,4243563512),f=S(f,r,x,e,n[a+7],T,1735328473),e=S(e,f,r,x,n[a+12],D,2368359562),x=s(x,e,f,r,n[a+5],F,4294588738),r=s(r,x,e,f,n[a+8],G,2272392833),f=s(f,r,x,e,n[a+11],I,1839030562),e=s(e,f,r,x,n[a+14],M,4259657740),x=s(x,e,f,r,n[a+1],F,2763975236),r=s(r,x,e,f,n[a+4],G,1272893353),f=s(f,r,x,e,n[a+7],I,4139469664),e=s(e,f,r,x,n[a+10],M,3200236656),x=s(x,e,f,r,n[a+13],F,681279174),r=s(r,x,e,f,n[a+0],G,3936430074),f=s(f,r,x,e,n[a+3],I,3572445317),e=s(e,f,r,x,n[a+6],M,76029189),x=s(x,e,f,r,n[a+9],F,3654602809),r=s(r,x,e,f,n[a+12],G,3873151461),f=s(f,r,x,e,n[a+15],I,530742520),e=s(e,f,r,x,n[a+2],M,3299628645),x=W(x,e,f,r,n[a+0],N,4096336452),r=W(r,x,e,f,n[a+7],O,1126891415),f=W(f,r,x,e,n[a+14],_,2878612391),e=W(e,f,r,x,n[a+5],L,4237533241),x=W(x,e,f,r,n[a+12],N,1700485571),r=W(r,x,e,f,n[a+3],O,2399980690),f=W(f,r,x,e,n[a+10],_,4293915773),e=W(e,f,r,x,n[a+1],L,2240044497),x=W(x,e,f,r,n[a+8],N,1873313359),r=W(r,x,e,f,n[a+15],O,4264355552),f=W(f,r,x,e,n[a+6],_,2734768916),e=W(e,f,r,x,n[a+13],L,1309151649),x=W(x,e,f,r,n[a+4],N,4149444226),r=W(r,x,e,f,n[a+11],O,3174756917),f=W(f,r,x,e,n[a+2],_,718787259),e=W(e,f,r,x,n[a+9],L,3951481745),x=o(x,k),e=o(e,w),f=o(f,P),r=o(r,U);return j==32?g(x)+g(e)+g(f)+g(r):g(e)+g(f)}export{Y as M};
